"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TagSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    creators: { type: [mongoose_1.default.Schema.Types.ObjectId], ref: "creator" },
    views: { type: Number, default: 0 }
}, {
    timestamps: true
});
const Tag = mongoose_1.default.model("tag", TagSchema);
exports.default = Tag;
