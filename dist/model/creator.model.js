"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const category_model_1 = __importDefault(require("./category.model"));
const tag_model_1 = __importDefault(require("./tag.model"));
var CreatorStatus;
(function (CreatorStatus) {
    CreatorStatus["ACTIVE"] = "active";
    CreatorStatus["PENDING"] = "pending";
    CreatorStatus["DETELE"] = "delete";
})(CreatorStatus || (CreatorStatus = {}));
const CreatorSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "category", required: true },
    tags: { type: [mongoose_1.default.Schema.Types.ObjectId], ref: "tag", required: true },
    views: { type: Number, default: 0 },
    mediaUrl: { type: String, required: true },
    slug: { type: String, required: true },
    status: { type: String, required: true, enum: Object.values(CreatorStatus) },
}, {
    timestamps: true
});
CreatorSchema.post("save", async function (doc) {
    try {
        const category = await category_model_1.default.findById(doc.category);
        if (category) {
            if (!category.creators.includes(doc._id)) {
                category.creators.push(doc._id);
                await category.save();
            }
        }
    }
    catch (error) {
        console.error(error);
    }
});
CreatorSchema.pre("findOneAndUpdate", async function (next) {
    try {
        const update = this.getUpdate();
        const filter = this.getFilter();
        if (update && "category" in update) {
            const creatorId = filter._id;
            const oldCreator = await Creator.findById(creatorId).exec();
            const oldCategoryId = oldCreator?.category?.toString();
            const newCategoryId = update.category.toString();
            if (oldCategoryId === newCategoryId) {
                return next();
            }
            if (oldCategoryId) {
                const oldCategory = await category_model_1.default.findById(oldCategoryId).exec();
                if (oldCategory) {
                    oldCategory.creators = oldCategory.creators.filter((id) => id.toString() !== creatorId.toString());
                    await oldCategory.save();
                }
            }
            const newCategory = await category_model_1.default.findById(newCategoryId).exec();
            if (newCategory && !newCategory.creators.includes(creatorId)) {
                newCategory.creators.push(creatorId);
                await newCategory.save();
            }
        }
        if (update && "tags" in update) {
            const creatorId = filter._id;
            const oldCreator = await Creator.findById(creatorId);
            if (!oldCreator)
                return;
            const updateTags = update.tags;
            const changedTags = oldCreator.tags.filter((oldTag) => !updateTags.some((newTag) => newTag.toString() === oldTag.toString()));
            if (changedTags.length === 0) {
                return next();
            }
            await Promise.all(changedTags.map(async (tagId) => {
                const tag = await tag_model_1.default.findById(tagId).exec();
                if (tag) {
                    tag.creators = tag.creators.filter((creator) => creator.toString() !== creatorId.toString());
                    await tag.save();
                }
            }));
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
CreatorSchema.pre("findOneAndDelete", async function (next) {
    try {
        const creatorId = this.getFilter()?._id;
        const creator = await Creator.findById(creatorId).exec();
        if (!creator)
            return next();
        const category = await category_model_1.default.findById(creator.category).exec();
        if (category) {
            category.creators = category.creators.filter((id) => id.toString() !== creator._id.toString());
            await category.save();
        }
        if (creator.tags.length > 0) {
            await Promise.all(creator.tags.map(async (tagId) => {
                const tag = await tag_model_1.default.findById(tagId).exec();
                if (tag) {
                    tag.creators = tag.creators.filter((id) => id.toString() !== creator._id.toString());
                    await tag.save();
                }
            }));
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const Creator = mongoose_1.default.model("creator", CreatorSchema);
exports.default = Creator;
