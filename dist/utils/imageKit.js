"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImage = exports.imagekit = exports.upload = void 0;
const imagekit_1 = __importDefault(require("imagekit"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage: storage });
exports.imagekit = new imagekit_1.default({
    publicKey: process.env.PUBLIC_KEY_IMAGEKIT || '',
    privateKey: process.env.PRIVATE_KEY_IMAGEKIT || '',
    urlEndpoint: "https://ik.imagekit.io/r9vwbtuo5/"
});
const processImage = async (doc, buffer, nameField) => {
    const { url } = await exports.imagekit.upload({
        file: buffer.toString("base64"),
        fileName: "name.jpg",
    });
    doc.set({ [nameField]: url });
    return doc;
};
exports.processImage = processImage;
