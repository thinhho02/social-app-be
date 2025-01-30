import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import connectDB from "./config/db";
import creatorRoute from "./routes/creator.route";
import categoryRoute from "./routes/category.route";
import tagRoute from "./routes/tag.route";
import Category from "./model/category.model";


const port = process.env.PORT || 3001
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: process.env.ORIGIN_PATH_FRONTEND || "*",
    credentials: true
}))

app.get("/", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 0

    const listCategory = await Category.find().limit(limit).populate({
        path: "creators",
        select: "-createdAt -updatedAt"
    }).exec()

    res.status(200).json({
        message: "List categories fetched successfully",
        data: listCategory,
    });
})

// routers
app.use("/creator", creatorRoute);
app.use("/category", categoryRoute);
app.use("/tag", tagRoute);

// middleware error handler
app.use(errorHandler)
app.listen(port, async () => {
    console.log(`server running listen port ${port}`);
    await connectDB()
})


export default app