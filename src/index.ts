import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import connectDB from "./config/db";
import creatorRoute from "./routes/creator.route";
import categoryRoute from "./routes/category.route";
import tagRoute from "./routes/tag.route";
import mongoose from "mongoose";


const port = process.env.PORT || 3001
const uri = process.env.MONGODB_URI || "";
if (uri == "") {
    throw new Error("Error connecting to MongoDB")
}
mongoose.connect(uri).then(res => console.log("MongoDB connected!")).catch(error => process.exit(1))

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: process.env.ORIGIN_PATH_FRONTEND || "*",
    credentials: true
}))

app.get("/", (req, res) => {
    res.send("connect")
})

// routers
app.use("/creator", creatorRoute);
app.use("/category", categoryRoute);
app.use("/tag", tagRoute);

// middleware error handler
app.use(errorHandler)
app.listen(port, () => {
    console.log(`server running listen port ${port}`);
})


export default app