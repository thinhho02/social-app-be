"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const errorHandler = (error, req, res, next) => {
    console.log(`Path: ${req.path}`, error);
    if (error instanceof zod_1.z.ZodError) {
        res.status(400).json({
            message: "Invalid input",
        });
    }
    else {
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
exports.default = errorHandler;
