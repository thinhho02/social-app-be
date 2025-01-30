"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const db_1 = __importDefault(require("./config/db"));
const creator_route_1 = __importDefault(require("./routes/creator.route"));
const category_route_1 = __importDefault(require("./routes/category.route"));
const tag_route_1 = __importDefault(require("./routes/tag.route"));
const port = process.env.PORT || 3001;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ORIGIN_PATH_FRONTEND || "*",
    credentials: true
}));
app.use("/creator", creator_route_1.default);
app.use("/category", category_route_1.default);
app.use("/tag", tag_route_1.default);
app.use(errorHandler_1.default);
app.listen(port, async () => {
    console.log(`server running listen port ${port}`);
    await (0, db_1.default)();
});
app.get("/", (req, res) => {
    res.send("connect");
});
