import { z } from "zod";
import catchError from "../utils/catchError";
import Tag from "../model/tag.model";
import generateSlug from "../utils/generateSlug";


const TagSchemaZod = z.object({
    name: z.string().min(1, "Name is required"),
    creators: z.string().array().optional(),
    views: z.number().optional(),
    slug: z.string().optional(),
});

export const createNewTag = catchError(async (req, res) => {
    const parsedData = TagSchemaZod.parse(req.body);

    const newTag = new Tag({
        name: parsedData.name,
        creators: parsedData.creators,
    });

    await generateSlug(newTag, Tag, "name", parsedData.name);
    await newTag.save();

    return res.status(201).json({
        message: "Tag created successfully",
        data: newTag,
    });
});

export const getAllTags = catchError(async (req, res) => {
    const tags = await Tag.find()
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


export const getTagBySlug = catchError(async (req, res) => {
    const { slug } = req.params;

    const tag = await Tag.findOne({ slug }).populate({
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
})

export const getTagByID = catchError(async (req, res) => {
    const { id } = req.params;

    const tag = await Tag.findById(id)
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

export const updateTag = catchError(async (req, res) => {
    const { id } = req.params;

    const parsedData = TagSchemaZod.partial().parse(req.body);
    const newTag = new Tag(parsedData);

    if (parsedData.name) {
        await generateSlug(newTag, Tag, "name", parsedData.name);
        parsedData.slug = newTag.slug;
        parsedData.name = newTag.name;
    }

    const updatedTag = await Tag.findByIdAndUpdate(id, parsedData, { new: true }).exec();

    if (!updatedTag) {
        return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({
        message: "Tag updated successfully",
        data: updatedTag,
    });
});

export const deleteTag = catchError(async (req, res) => {
    const { id } = req.params;

    const deletedTag = await Tag.findByIdAndDelete(id).exec();

    if (!deletedTag) {
        return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({ message: "Tag deleted successfully" });
});

export const hotTag = catchError(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const trendingCreators = await Tag.find({
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

export const incrementViews = catchError(async (req, res) => {
    const { slug } = req.params;

    const updatedTag = await Tag.findOneAndUpdate(
        {slug},
        { $inc: { views: 1 } },
        { new: true }
    ).exec();

    if (!updatedTag) {
        return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({
        message: "Tag views incremented successfully",
        data: updatedTag,
    });
});