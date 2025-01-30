"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const creator_controller_1 = require("../controllers/creator.controller");
const imageKit_1 = require("../utils/imageKit");
const creatorRoute = (0, express_1.Router)();
creatorRoute.get("/newest", creator_controller_1.newestHandler);
creatorRoute.get("/recommand", creator_controller_1.recommendHandler);
creatorRoute.get("/trending", creator_controller_1.trendingHandler);
creatorRoute.get("/slug/:slug", creator_controller_1.getCreatorBySlug);
creatorRoute.get("/:id", creator_controller_1.getCreatorByID);
creatorRoute.get("/", creator_controller_1.getListCreators);
creatorRoute.post("/", imageKit_1.upload.single("imageUpload"), creator_controller_1.createNewCreator);
creatorRoute.put("/increment-views/:slug", creator_controller_1.incrementViews);
creatorRoute.put("/:id", imageKit_1.upload.single("imageUpload"), creator_controller_1.updateCreator);
creatorRoute.delete("/:id", creator_controller_1.deleteCreator);
exports.default = creatorRoute;
