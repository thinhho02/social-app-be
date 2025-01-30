import mongoose from "mongoose";
import Creator from "./creator.model";
import Tag from "./tag.model";


interface ICategory extends mongoose.Document {
    name: string;
    slug: string;
    creators: mongoose.Types.ObjectId[];
    mediaUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new mongoose.Schema<ICategory>({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    creators: { type: [mongoose.Schema.Types.ObjectId], ref: "creator" },
    mediaUrl: { type: String, required: true },
}, {
    timestamps: true
})

CategorySchema.pre("findOneAndDelete", async function (next) {
    try {
        const categoryId = this.getFilter()?._id;

        // Lấy category để xử lý các liên kết
        const category = await Category.findById(categoryId).exec();
        if (!category) return next();

        const creatorIds = category.creators;

        // Xóa tất cả các Creator trong mảng của Category
        if (creatorIds.length > 0) {
            await Promise.all(
                creatorIds.map(async (creatorId) => {
                    // Xóa Creator và xử lý các liên kết của nó (Tag)
                    const creator = await Creator.findByIdAndDelete(creatorId).exec();
                    if (creator) {
                        // Xóa creator khỏi mảng creators trong các Tag liên quan
                        await Promise.all(
                            creator.tags.map(async (tagId) => {
                                const tag = await Tag.findById(tagId).exec();
                                if (tag) {
                                    tag.creators = tag.creators.filter(
                                        (id) => id.toString() !== (creator._id as mongoose.Types.ObjectId).toString()
                                    );
                                    await tag.save();
                                }
                            })
                        );
                    }
                })
            );
        }

        next();
    } catch (error) {
        next(error as Error);
    }
});

const Category = mongoose.model<ICategory>("category", CategorySchema)

export default Category
