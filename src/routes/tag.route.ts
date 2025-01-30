import { Router } from "express";
import {
    createNewTag,
    deleteTag,
    getAllTags,
    getTagByID,
    getTagBySlug,
    hotTag,
    incrementViews,
    updateTag
} from "../controllers/tag.controller";

const tagRoute = Router();

tagRoute.get("/hot", hotTag);
tagRoute.get("/slug/:slug", getTagBySlug);
tagRoute.get("/:id", getTagByID);
tagRoute.get("/", getAllTags)

tagRoute.post("/", createNewTag);

tagRoute.put("/increment-views/:slug", incrementViews);
tagRoute.put("/:id", updateTag);

tagRoute.delete("/:id", deleteTag);

export default tagRoute