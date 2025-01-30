"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slugify_1 = __importDefault(require("slugify"));
const generateSlug = async (newDoc, model, nameField, name) => {
    let slug = (0, slugify_1.default)(name, { lower: true, strict: true });
    let counter = 0;
    while (true) {
        const existingDoc = await model.findOne({ slug }).exec();
        if (!existingDoc) {
            break;
        }
        ++counter;
        slug = (0, slugify_1.default)(`${name} ${counter}`, { lower: true, strict: true });
    }
    newDoc.set({
        [nameField]: counter > 0 ? `${name} ${counter}` : name,
        slug
    });
};
exports.default = generateSlug;
