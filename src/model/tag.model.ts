import mongoose from "mongoose";


interface ITag extends mongoose.Document {
    name: string;
    creators: mongoose.Types.ObjectId[];
    views: number;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

const TagSchema = new mongoose.Schema<ITag>({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    creators: { type: [mongoose.Schema.Types.ObjectId], ref: "creator" },
    views: { type: Number, default: 0 }
}, {
    timestamps: true
})

const Tag = mongoose.model<ITag>("tag", TagSchema)

export default Tag
