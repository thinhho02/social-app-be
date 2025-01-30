"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchByName = exports.deleteCategory = exports.updateCategory = exports.getListCategory = exports.getCategoryByID = exports.getCategoryBySlug = exports.createNewCategory = void 0;
const zod_1 = require("zod");
const catchError_1 = __importDefault(require("../utils/catchError"));
const category_model_1 = __importDefault(require("../model/category.model"));
const generateSlug_1 = __importDefault(require("../utils/generateSlug"));
const imageKit_1 = require("../utils/imageKit");
const CategorySchemaZod = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    creators: zod_1.z.string().array().optional(),
    mediaUrl: zod_1.z.string().optional(),
    slug: zod_1.z.string().optional()
});
exports.createNewCategory = (0, catchError_1.default)(async (req, res) => {
    const parsedData = CategorySchemaZod.parse(req.body);
    const newCategory = new category_model_1.default({
        name: parsedData.name,
        creators: parsedData.creators
    });
    if (req.file?.size) {
        await (0, imageKit_1.processImage)(newCategory, req.file.buffer, 'mediaUrl');
    }
    await (0, generateSlug_1.default)(newCategory, category_model_1.default, "name", parsedData.name);
    console.log(newCategory);
    await newCategory.save();
    return res.status(201).json({
        message: "Category created successfully",
        creator: newCategory,
    });
});
exports.getCategoryBySlug = (0, catchError_1.default)(async (req, res) => {
    const { slug } = req.params;
    const category = await category_model_1.default.findOne({ slug })
        .populate({
        path: "creators",
        select: "-createdAt -updatedAt",
    })
        .exec();
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({
        message: "Category fetched successfully",
        data: category,
    });
});
exports.getCategoryByID = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const category = await category_model_1.default.findById(id)
        .populate({
        path: "creators",
        select: "-createdAt -updatedAt",
    })
        .exec();
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({
        message: "Category fetched successfully",
        data: category,
    });
});
exports.getListCategory = (0, catchError_1.default)(async (req, res) => {
    const limit = parseInt(req.query.limit) || 0;
    const listCategory = await category_model_1.default.find().limit(limit).populate({
        path: "creators",
        select: "-createdAt -updatedAt"
    }).exec();
    res.status(200).json({
        message: "List categories fetched successfully",
        data: listCategory,
    });
});
exports.updateCategory = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const oldCategory = await category_model_1.default.findById(id);
    if (!oldCategory) {
        return res.status(404).json({ message: "Category not found" });
    }
    const parsedData = CategorySchemaZod.partial().parse(req.body);
    const newCategory = new category_model_1.default(parsedData);
    if (parsedData.name && parsedData.name !== oldCategory.name) {
        await (0, generateSlug_1.default)(newCategory, category_model_1.default, "name", parsedData.name);
        parsedData.slug = newCategory.slug;
        parsedData.name = newCategory.name;
    }
    if (req.file?.size) {
        await (0, imageKit_1.processImage)(newCategory, req.file.buffer, 'mediaUrl');
        parsedData.mediaUrl = newCategory.mediaUrl;
    }
    const updatedCategory = await category_model_1.default.findByIdAndUpdate(id, parsedData, { new: true }).exec();
    res.status(200).json({
        message: "Category updated successfully",
        data: updatedCategory
    });
});
exports.deleteCategory = (0, catchError_1.default)(async (req, res) => {
    const { id } = req.params;
    const deletedCategory = await category_model_1.default.findByIdAndDelete(id).exec();
    if (!deletedCategory) {
        return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
});
exports.searchByName = (0, catchError_1.default)(async (req, res) => {
    const { name } = req.query;
    if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Invalid or missing 'name' query parameter" });
    }
    const regex = new RegExp(name, "i");
    const categories = await category_model_1.default.find({ name: regex })
        .populate({
        path: "creators",
        select: "-createdAt -updatedAt"
    })
        .exec();
    if (categories.length === 0) {
        return res.status(404).json({ message: "No categories found matching the search" });
    }
    res.status(200).json({
        message: "Search results fetched successfully",
        data: categories,
    });
});
