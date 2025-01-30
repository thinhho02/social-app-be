"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const creator_model_1 = __importDefault(require("./creator.model"));
const tag_model_1 = __importDefault(require("./tag.model"));
const CategorySchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    creators: { type: [mongoose_1.default.Schema.Types.ObjectId], ref: "creator" },
    mediaUrl: { type: String, required: true },
}, {
    timestamps: true
});
CategorySchema.pre("findOneAndDelete", async function (next) {
    try {
        const categoryId = this.getFilter()?._id;
        const category = await Category.findById(categoryId).exec();
        if (!category)
            return next();
        const creatorIds = category.creators;
        if (creatorIds.length > 0) {
            await Promise.all(creatorIds.map(async (creatorId) => {
                const creator = await creator_model_1.default.findByIdAndDelete(creatorId).exec();
                if (creator) {
                    await Promise.all(creator.tags.map(async (tagId) => {
                        const tag = await tag_model_1.default.findById(tagId).exec();
                        if (tag) {
                            tag.creators = tag.creators.filter((id) => id.toString() !== creator._id.toString());
                            await tag.save();
                        }
                    }));
                }
            }));
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
const Category = mongoose_1.default.model("category", CategorySchema);
exports.default = Category;
