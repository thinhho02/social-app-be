"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementViews = exports.hotTag = exports.deleteTag = exports.updateTag = exports.getTagByID = exports.getTagBySlug = exports.getAllTags = exports.createNewTag = void 0;
const zod_1 = require("zod");
const catchError_1 = __importDefault(require("../utils/catchError"));
const tag_model_1 = __importDefault(require("../model/tag.model"));
const generateSlug_1 = __importDefault(require("../utils/generateSlug"));
const TagSchemaZod = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    creators: zod_1.z.string().array().optional(),
    views: zod_1.z.number().optional(),
    slug: zod_1.z.string().optional(),
});
exports.createNewTag = (0, catchError_1.default)(async (req, res) => {
    const parsedData = TagSchemaZod.parse(req.body);
    const newTag = new tag_model_1.default({
        name: parsedData.name,
        creators: parsedData.creators,
    });
    await (0, generateSlug_1.default)(newTag, tag_model_1.default, "name", parsedData.name);
    await newTag.save();
    return res.status(201).json({
        message: "Tag created successfully",
        data: newTag,
    });
});
exports.getAllTags = (0, catchError_1.default)(async (req, res) => {
    const tags = await tag_model_1.default.find()
        .populate({
        path: "creators",
        select: "-createdAt -updatedAt",
    })
        .exec();
    res.status(200).json({
        message: "List all tags fetched successfully",
        data: tags,
    });
});
exports.getTagBySlug = (0, catchError_1.default)(async (req, res) => {
    const { slug } = req.params;
    const tag = await tag_model_1.default.findOne({ slug }).populate({
        path: "creators",
        select: "-createdAt -updatedAt",
    }).exec();
    if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json({
        message: "Tag fetched successfully",
        data: tag,
    });
});
exports.getTagByID = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const tag = await tag_model_1.default.findById(id)
        .populate({
        path: "creators",
        select: "-createdAt -updatedAt",
    })
        .exec();
    if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json({
        message: "Tag fetched successfully",
        data: tag,
    });
});
exports.updateTag = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const parsedData = TagSchemaZod.partial().parse(req.body);
    const newTag = new tag_model_1.default(parsedData);
    if (parsedData.name) {
        await (0, generateSlug_1.default)(newTag, tag_model_1.default, "name", parsedData.name);
        parsedData.slug = newTag.slug;
        parsedData.name = newTag.name;
    }
    const updatedTag = await tag_model_1.default.findByIdAndUpdate(id, parsedData, { new: true }).exec();
    if (!updatedTag) {
        return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json({
        message: "Tag updated successfully",
        data: updatedTag,
    });
});
exports.deleteTag = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const deletedTag = await tag_model_1.default.findByIdAndDelete(id).exec();
    if (!deletedTag) {
        return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json({ message: "Tag deleted successfully" });
});
exports.hotTag = (0, catchError_1.default)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const trendingCreators = await tag_model_1.default.find({
        updatedAt: { $gte: startDate },
    })
        .sort({ views: -1 })
        .limit(limit)
        .populate([
        { path: "creators", select: "-createdAt -updatedAt" },
    ])
        .exec();
    res.status(200).json({
        message: "Trending tags fetched successfully",
        data: trendingCreators,
    });
});
exports.incrementViews = (0, catchError_1.default)(async (req, res) => {
    const { slug } = req.params;
    const updatedTag = await tag_model_1.default.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true }).exec();
    if (!updatedTag) {
        return res.status(404).json({ message: "Tag not found" });
    }
    res.status(200).json({
        message: "Tag views incremented successfully",
        data: updatedTag,
    });
});
