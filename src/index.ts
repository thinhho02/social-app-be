import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import connectDB from "./config/db";
import creatorRoute from "./routes/creator.route";
import categoryRoute from "./routes/category.route";
import tagRoute from "./routes/tag.route";


const port = process.env.PORT || 3001
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors({
    origin: process.env.ORIGIN_PATH_FRONTEND || "*",
    credentials: true
}))
app.listen(port, async () => {
    console.log(`server running listen port ${port}`);
    await connectDB()
})

app.get("/", (req, res) => {
   res.send("connect")
})

// routers
app.use("/creator", creatorRoute);
app.use("/category", categoryRoute);
app.use("/tag", tagRoute);

// middleware error handler
app.use(errorHandler)


export default app