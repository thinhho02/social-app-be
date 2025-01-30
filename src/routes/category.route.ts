import { Router } from "express";
import {
    createNewCategory,
    deleteCategory,
    getCategoryByID,
    getCategoryBySlug,
    getListCategory,
    searchByName,
    updateCategory
} from "../controllers/category.controller";
import { upload } from "../utils/imageKit";

const categoryRouter = Router();

categoryRouter.get("/search", searchByName);
categoryRouter.get("/slug/:slug", getCategoryBySlug);
categoryRouter.get("/:id", getCategoryByID);
categoryRouter.get("/", getListCategory);

categoryRouter.post("/", upload.single("imageUpload"), createNewCategory);

categoryRouter.put("/:id", upload.single("imageUpload"), updateCategory);

categoryRouter.delete("/:id", deleteCategory);


export default categoryRouter