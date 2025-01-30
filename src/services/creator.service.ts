import { ObjectId, Types } from "mongoose";
import Tag from "../model/tag.model"
import slugify from "slugify";

export const handleTags = async (creatorID: ObjectId, tags: string[]): Promise<Array<Types.ObjectId>> => {
    const slugs = tags.map((tag) => ({
        name: tag,
        slug: slugify(tag, { lower: true, strict: true })
    }))
    const existingSlug = slugs.map((slug) => slug.slug)
    const existTags = await Tag.find({
        slug: { $in: existingSlug },
    });
    const existingTagSlugs = existTags.map((tag) => ({ slugTag: tag.slug, name: tag.name }));
    const newTagNames = slugs.filter((e) => !existingTagSlugs.some((slug) => e.slug === slug.slugTag));

    const tagID: Types.ObjectId[] = [];

    if (existTags.length) {
        await Promise.all(
            existTags.map((tag) =>
                Tag.updateOne(
                    { _id: tag._id },
                    { $addToSet: { creators: creatorID } }
                ).then(() => tagID.push(tag.id))
            )
        );
    }
    if (newTagNames.length) {
        const newTags = newTagNames.map((data) => ({
            name: data.name,
            slug: data.slug,
            creators: [creatorID],
        }));

        const insertedTags = await Tag.insertMany(newTags)
        insertedTags.map((tag) => tagID.push(tag.id))
    }

    return tagID
}