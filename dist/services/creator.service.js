"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTags = void 0;
const tag_model_1 = __importDefault(require("../model/tag.model"));
const slugify_1 = __importDefault(require("slugify"));
const handleTags = async (creatorID, tags) => {
    const slugs = tags.map((tag) => ({
        name: tag,
        slug: (0, slugify_1.default)(tag, { lower: true, strict: true })
    }));
    const existingSlug = slugs.map((slug) => slug.slug);
    const existTags = await tag_model_1.default.find({
        slug: { $in: existingSlug },
    });
    const existingTagSlugs = existTags.map((tag) => ({ slugTag: tag.slug, name: tag.name }));
    const newTagNames = slugs.filter((e) => !existingTagSlugs.some((slug) => e.slug === slug.slugTag));
    const tagID = [];
    if (existTags.length) {
        await Promise.all(existTags.map((tag) => tag_model_1.default.updateOne({ _id: tag._id }, { $addToSet: { creators: creatorID } }).then(() => tagID.push(tag.id))));
    }
    if (newTagNames.length) {
        const newTags = newTagNames.map((data) => ({
            name: data.name,
            slug: data.slug,
            creators: [creatorID],
        }));
        const insertedTags = await tag_model_1.default.insertMany(newTags);
        insertedTags.map((tag) => tagID.push(tag.id));
    }
    return tagID;
};
exports.handleTags = handleTags;
