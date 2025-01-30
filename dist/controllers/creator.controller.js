"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementViews = exports.recommendHandler = exports.newestHandler = exports.trendingHandler = exports.deleteCreator = exports.updateCreator = exports.createNewCreator = exports.getCreatorBySlug = exports.getCreatorByID = exports.getListCreators = void 0;
const zod_1 = require("zod");
const catchError_1 = __importDefault(require("../utils/catchError"));
const creator_model_1 = __importDefault(require("../model/creator.model"));
const generateSlug_1 = __importDefault(require("../utils/generateSlug"));
const creator_service_1 = require("../services/creator.service");
const imageKit_1 = require("../utils/imageKit");
const CreatorSchemaZod = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    category: zod_1.z.string().min(1, "At least one category is required"),
    tags: zod_1.z.string().array().optional(),
    mediaUrl: zod_1.z.string().optional(),
    status: zod_1.z.enum(["active", "delete", "pending"]),
    slug: zod_1.z.string().optional()
});
exports.getListCreators = (0, catchError_1.default)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 0;
    const listCreator = await creator_model_1.default.find().limit(limit).populate([
        { path: "tags", select: "-createdAt -updatedAt" },
        { path: "category", select: "-createdAt -updatedAt" },
    ]).exec();
    res.status(200).json({
        message: "List creators fetched successfully",
        data: listCreator,
    });
});
exports.getCreatorByID = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.body;
    const findCreatorByID = await creator_model_1.default.findById(id).populate([
        { path: "tags", select: "-createdAt -updatedAt" },
        { path: "category", select: "-createdAt -updatedAt" },
    ]).exec();
    if (!findCreatorByID) {
        return res.status(404).json({ message: "Creator not found" });
    }
    res.status(200).json({
        message: "Creator fetched successfully",
        data: findCreatorByID
    });
});
exports.getCreatorBySlug = (0, catchError_1.default)(async (req, res) => {
    const { slug } = req.params;
    const creator = await creator_model_1.default.findOne({ slug }).populate([
        { path: "tags", select: "-createdAt -updatedAt" },
        { path: "category", select: "-createdAt -updatedAt" },
    ]).exec();
    if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
    }
    res.status(200).json({
        message: "Creator fetched successfully",
        data: creator,
    });
});
exports.createNewCreator = (0, catchError_1.default)(async (req, res) => {
    if (req.body?.tags) {
        req.body.tags = JSON.parse(req.body.tags);
    }
    const parsedData = CreatorSchemaZod.parse(req.body);
    const newCreator = new creator_model_1.default({
        name: parsedData.name,
        description: parsedData.description,
        category: parsedData.category,
        status: parsedData.status,
    });
    if (parsedData.tags && parsedData.tags.length > 0) {
        const tags = await (0, creator_service_1.handleTags)(newCreator.id, parsedData.tags);
        newCreator.tags = tags;
    }
    if (req.file?.size) {
        await (0, imageKit_1.processImage)(newCreator, req.file.buffer, 'mediaUrl');
    }
    await (0, generateSlug_1.default)(newCreator, creator_model_1.default, "name", parsedData.name);
    await newCreator.save();
    res.status(201).json({
        message: "Creator created successfully",
        data: newCreator,
    });
});
exports.updateCreator = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const oldCreator = await creator_model_1.default.findById(id);
    if (!oldCreator) {
        return res.status(404).json({ message: "Creator not found" });
    }
    if (req.body?.tags) {
        req.body.tags = JSON.parse(req.body.tags);
    }
    const parsedData = CreatorSchemaZod.partial().parse(req.body);
    const newCreator = new creator_model_1.default(parsedData);
    if (parsedData.name && parsedData.name !== oldCreator.name) {
        await (0, generateSlug_1.default)(newCreator, creator_model_1.default, "name", parsedData.name);
        parsedData.slug = newCreator.slug;
        parsedData.name = newCreator.name;
    }
    if (parsedData.tags && parsedData.tags.length > 0) {
        console.log(req.body);
        const tags = await (0, creator_service_1.handleTags)(oldCreator.id, parsedData.tags);
        parsedData.tags = tags.map((tag) => tag.toString());
    }
    if (req.file?.size) {
        await (0, imageKit_1.processImage)(newCreator, req.file.buffer, 'mediaUrl');
        parsedData.mediaUrl = newCreator.mediaUrl;
    }
    const updatedCreator = await creator_model_1.default.findByIdAndUpdate(id, parsedData, { new: true }).exec();
    res.status(200).json({
        message: "Creator updated successfully",
        data: updatedCreator
    });
});
exports.deleteCreator = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const deletedCreator = await creator_model_1.default.findByIdAndDelete(id).exec();
    if (!deletedCreator) {
        return res.status(404).json({ message: "Creator not found" });
    }
    res.status(200).json({ message: "Creator deleted successfully" });
});
exports.trendingHandler = (0, catchError_1.default)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const trendingCreators = await creator_model_1.default.find({
        status: "active",
        updatedAt: { $gte: startDate },
    })
        .sort({ views: -1 })
        .limit(limit)
        .populate([
        { path: "tags", select: "-createdAt -updatedAt" },
        { path: "category", select: "-createdAt -updatedAt" },
    ])
        .exec();
    res.status(200).json({
        message: "Trending creators fetched successfully",
        data: trendingCreators,
    });
});
exports.newestHandler = (0, catchError_1.default)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const newestCreators = await creator_model_1.default.find({ status: "active" })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate([
        { path: "tags", select: "-createdAt -updatedAt" },
        { path: "category", select: "-createdAt -updatedAt" },
    ])
        .exec();
    res.status(200).json({
        message: "Newest creators fetched successfully",
        data: newestCreators,
    });
});
exports.recommendHandler = (0, catchError_1.default)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const recommendedCreators = await creator_model_1.default.find({ status: "active" })
        .sort({ views: -1 })
        .limit(limit)
        .populate([
        { path: "tags", select: "-createdAt -updatedAt" },
        { path: "category", select: "-createdAt -updatedAt" },
    ])
        .exec();
    res.status(200).json({
        message: "Recommended creators fetched successfully",
        data: recommendedCreators,
    });
});
exports.incrementViews = (0, catchError_1.default)(async (req, res) => {
    const { slug } = req.params;
    const updatedCreator = await creator_model_1.default.findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { new: true }).exec();
    if (!updatedCreator) {
        return res.status(404).json({ message: "Creator not found" });
    }
    res.status(200).json({
        message: "Creator views incremented successfully",
        data: updatedCreator,
    });
});
