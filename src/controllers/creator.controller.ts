import { z } from "zod";
import catchError from "../utils/catchError";
import Creator from "../model/creator.model";
import generateSlug from "../utils/generateSlug";
import { handleTags } from "../services/creator.service";
import { processImage } from "../utils/imageKit";


const CreatorSchemaZod = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "At least one category is required"),
    tags: z.string().array().optional(),
    mediaUrl: z.string().optional(),
    status: z.enum(["active", "pending"]),
    slug: z.string().optional()
})

export const getListCreators = catchError(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 0

    const listCreator = await Creator.find().limit(limit).populate([
        { path: "tags", select: "-createdAt -updatedAt" },
        { path: "category", select: "-createdAt -updatedAt" },
    ]).exec()

    res.status(200).json({
        message: "List creators fetched successfully",
        data: listCreator,
    });
})

export const getCreatorByID = catchError(async (req, res) => {
    const { id } = req.body
    const findCreatorByID = await Creator.findById(id).populate([
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
})

export const getCreatorBySlug = catchError(async (req, res) => {
    const { slug } = req.params;

    const creator = await Creator.findOne({ slug }).populate([
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
})

export const createNewCreator = catchError(async (req, res) => {
    if (req.body?.tags) {
        req.body.tags = JSON.parse(req.body.tags)
    }
    const parsedData = CreatorSchemaZod.parse(req.body);

    const newCreator = new Creator({
        name: parsedData.name,
        description: parsedData.description,
        category: parsedData.category,
        status: parsedData.status,
    });

    if (parsedData.tags && parsedData.tags.length > 0) {
        const tags = await handleTags(newCreator.id, parsedData.tags)
        newCreator.tags = tags
    }
    if (req.file?.size) {
        await processImage(newCreator, req.file.buffer, 'mediaUrl')
    }
    await generateSlug(newCreator, Creator, "name", parsedData.name)
    await newCreator.save()

    res.status(201).json({
        message: "Creator created successfully",
        data: newCreator,
    });
})

export const updateCreator = catchError(async (req, res) => {
    const { id } = req.params;

    const oldCreator = await Creator.findById(id)
    if (!oldCreator) {
        return res.status(404).json({ message: "Creator not found" });
    }
    if (req.body?.tags) {
        req.body.tags = JSON.parse(req.body.tags)
    }
    const parsedData = CreatorSchemaZod.partial().parse(req.body);
    const newCreator = new Creator(parsedData);

    if (parsedData.name && parsedData.name !== oldCreator.name) {
        await generateSlug(newCreator, Creator, "name", parsedData.name)
        parsedData.slug = newCreator.slug
        parsedData.name = newCreator.name
    }
    if (parsedData.tags && parsedData.tags.length > 0) {
        console.log(req.body)

        const tags = await handleTags(oldCreator.id, parsedData.tags)
        parsedData.tags = tags.map((tag) => tag.toString())
    }
    if (req.file?.size) {
        await processImage(newCreator, req.file.buffer, 'mediaUrl')
        parsedData.mediaUrl = newCreator.mediaUrl
    }

    const updatedCreator = await Creator.findByIdAndUpdate(id, parsedData, { new: true }).exec();

    res.status(200).json({
        message: "Creator updated successfully",
        data: updatedCreator
    });
})

export const deleteCreator = catchError(async (req, res) => {
    const { id } = req.params;

    const deletedCreator = await Creator.findByIdAndDelete(id).exec();

    if (!deletedCreator) {
        return res.status(404).json({ message: "Creator not found" });
    }

    res.status(200).json({ message: "Creator deleted successfully" });
})

export const trendingHandler = catchError(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const trendingCreators = await Creator.find({
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

export const newestHandler = catchError(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const newestCreators = await Creator.find({ status: "active" })
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

export const recommendHandler = catchError(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const recommendedCreators = await Creator.find({ status: "active" })
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

export const incrementViews = catchError(async (req, res) => {
    const { slug } = req.params;

    const updatedCreator = await Creator.findOneAndUpdate(
        { slug },
        { $inc: { views: 1 } },
        { new: true }
    ).exec();

    if (!updatedCreator) {
        return res.status(404).json({ message: "Creator not found" });
    }

    res.status(200).json({
        message: "Creator views incremented successfully",
        data: updatedCreator,
    });
});


