import { z } from "zod";
import catchError from "../utils/catchError";
import Category from "../model/category.model";
import generateSlug from "../utils/generateSlug";
import { processImage } from "../utils/imageKit";

const CategorySchemaZod = z.object({
    name: z.string().min(1, "Name is required"),
    creators: z.string().array().optional(),
    mediaUrl: z.string().optional(),
    slug: z.string().optional()
})

export const createNewCategory = catchError(async (req, res) => {
    const parsedData = CategorySchemaZod.parse(req.body)
    const newCategory = new Category({
        name: parsedData.name,
        creators: parsedData.creators
    });
    if (req.file?.size) {
        await processImage(newCategory, req.file.buffer, 'mediaUrl')
    }
    await generateSlug(newCategory, Category, "name", parsedData.name)
    console.log(newCategory)
    await newCategory.save();

    return res.status(201).json({
        message: "Category created successfully",
        creator: newCategory,
    });
})

export const getCategoryBySlug = catchError(async (req, res) => {
    const { slug } = req.params;
    const condition = (req.query.status as string) ? { status: req.query.status } : {};

    const category = await Category.findOne({ slug })
        .populate({
            path: "creators",
            match: condition,
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
})

export const getCategoryByID = catchError(async (req, res) => {
    const { id } = req.params;
    const condition = (req.query.status as string) ? { status: req.query.status } : {};

    const category = await Category.findById(id)
        .populate({
            path: "creators",
            match: condition,
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
})

export const getListCategory = catchError(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 0
    const condition = (req.query.status as string) ? { status: req.query.status } : {};

    const listCategory = await Category.find().limit(limit).populate({
        path: "creators",
        match: condition,
        select: "-createdAt -updatedAt"
    }).exec()

    res.status(200).json({
        message: "List categories fetched successfully",
        data: listCategory,
    });
})


export const updateCategory = catchError(async (req, res) => {
    const { id } = req.params;

    const oldCategory = await Category.findById(id)
    if (!oldCategory) {
        return res.status(404).json({ message: "Category not found" });
    }

    const parsedData = CategorySchemaZod.partial().parse(req.body);
    const newCategory = new Category(parsedData);
    if (parsedData.name && parsedData.name !== oldCategory.name) {
        await generateSlug(newCategory, Category, "name", parsedData.name)
        parsedData.slug = newCategory.slug
        parsedData.name = newCategory.name
    }

    if (req.file?.size) {
        await processImage(newCategory, req.file.buffer, 'mediaUrl')
        parsedData.mediaUrl = newCategory.mediaUrl
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, parsedData, { new: true }).exec();

    res.status(200).json({
        message: "Category updated successfully",
        data: updatedCategory
    });
})

export const deleteCategory = catchError(async (req, res) => {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id).exec();

    if (!deletedCategory) {
        return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
})

export const searchByName = catchError(async (req, res) => {
    const { name } = req.query;

    if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Invalid or missing 'name' query parameter" });
    }

    const regex = new RegExp(name, "i");

    const categories = await Category.find({ name: regex })
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
})

