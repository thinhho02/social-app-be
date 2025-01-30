import { Router } from "express";
import {
    createNewCreator,
    deleteCreator,
    getCreatorByID,
    getCreatorBySlug,
    getListCreators,
    incrementViews,
    newestHandler,
    recommendHandler,
    trendingHandler,
    updateCreator
} from "../controllers/creator.controller";
import { upload } from "../utils/imageKit";

const creatorRoute = Router();

creatorRoute.get("/newest", newestHandler);
creatorRoute.get("/recommand", recommendHandler);
creatorRoute.get("/trending", trendingHandler);
creatorRoute.get("/slug/:slug", getCreatorBySlug);
creatorRoute.get("/:id", getCreatorByID);
creatorRoute.get("/", getListCreators);

creatorRoute.post("/", upload.single("imageUpload"), createNewCreator);

creatorRoute.put("/increment-views/:slug", incrementViews);
creatorRoute.put("/:id",upload.single("imageUpload"), updateCreator);

creatorRoute.delete("/:id", deleteCreator);

export default creatorRoute