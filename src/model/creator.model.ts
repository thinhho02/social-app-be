import mongoose from "mongoose";
import Category from "./category.model";
import Tag from "./tag.model";

enum CreatorStatus {
  ACTIVE = "active",
  PENDING = "pending",
  DETELE = "delete"
}

interface ICreator extends mongoose.Document {
  name: string;
  description: string;
  views: number;
  category: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  mediaUrl: string;
  slug: string;
  status: CreatorStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CreatorSchema = new mongoose.Schema<ICreator>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "category", required: true },
  tags: { type: [mongoose.Schema.Types.ObjectId], ref: "tag", required: true },
  views: { type: Number, default: 0 },
  mediaUrl: { type: String, required: true },
  slug: { type: String, required: true },
  status: { type: String, required: true, enum: Object.values(CreatorStatus) },
}, {
  timestamps: true
});

CreatorSchema.post("save", async function (doc) {
  try {
    const category = await Category.findById(doc.category);

    if (category) {

      if (!category.creators.includes(doc._id as mongoose.Types.ObjectId)) {
        category.creators.push(doc._id as mongoose.Types.ObjectId);
        await category.save();
      }
    }
  } catch (error) {
    console.error(error);
  }
})

CreatorSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();
    const filter = this.getFilter();

    if (update && "category" in update) {
      const creatorId = filter._id;

      const oldCreator = await Creator.findById(creatorId).exec();
      const oldCategoryId = oldCreator?.category?.toString();
      const newCategoryId = update.category.toString();

      if (oldCategoryId === newCategoryId) {
        return next();
      }

      if (oldCategoryId) {
        const oldCategory = await Category.findById(oldCategoryId).exec();
        if (oldCategory) {
          oldCategory.creators = oldCategory.creators.filter(
            (id) => id.toString() !== creatorId.toString()
          );
          await oldCategory.save();
        }
      }

      const newCategory = await Category.findById(newCategoryId).exec();
      if (newCategory && !newCategory.creators.includes(creatorId)) {
        newCategory.creators.push(creatorId);
        await newCategory.save();
      }
    }
    if (update && "tags" in update) {

      const creatorId = filter._id;

      const oldCreator = await Creator.findById(creatorId);
      if (!oldCreator) return;

      const updateTags: mongoose.Types.ObjectId[] = update.tags

      const changedTags = oldCreator.tags.filter((oldTag) => !updateTags.some((newTag) => newTag.toString() === oldTag.toString()))
      if (changedTags.length === 0) {
        return next();
      }

      await Promise.all(
        changedTags.map(async (tagId) => {
          const tag = await Tag.findById(tagId).exec();
          if (tag) {
            tag.creators = tag.creators.filter(
              (creator) => creator.toString() !== creatorId.toString()
            );
            await tag.save();
          }
        }
        )
      );
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

CreatorSchema.pre("findOneAndDelete", async function (next) {
  try {
    const creatorId = this.getFilter()?._id;

    // Lấy Creator để xử lý các liên kết
    const creator = await Creator.findById(creatorId).exec();
    if (!creator) return next();

    // Xóa Creator khỏi mảng creators trong Category liên quan
    const category = await Category.findById(creator.category).exec();
    if (category) {
      category.creators = category.creators.filter(
        (id) => id.toString() !== (creator._id as mongoose.Types.ObjectId).toString()
      );
      await category.save();
    }

    // Xóa Creator khỏi mảng creators trong các Tag liên quan
    if (creator.tags.length > 0) {
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

    next();
  } catch (error) {
    next(error as Error);
  }
});


const Creator = mongoose.model<ICreator>("creator", CreatorSchema)

export default Creator