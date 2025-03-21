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
if (!process.env.ORIGIN_PATH_FRONTEND || !process.env.ORIGIN_PATH_ADMIN) {
    process.exit(1)
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
const allowedOrigins = [
    process.env.ORIGIN_PATH_FRONTEND,
    process.env.ORIGIN_PATH_ADMIN,
    "*"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

// routers
app.use("/creator", creatorRoute);
app.use("/category", categoryRoute);
app.use("/tag", tagRoute);

// middleware error handler
app.use(errorHandler)
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`server running listen port ${port}`);
    })
}).catch(error => {
    console.log(`error server`);
    process.exit(1)
})


export default app