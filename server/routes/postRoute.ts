import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  generatePost,
  getGenerations,
  getPost,
  schedulePost,
} from "../controllers/postController.js";
import upload from "../config/multer.js";

const postRouter = Router();

postRouter.get("/", protect, getPost);
postRouter.get("/generations", protect, getGenerations);
postRouter.post("/", protect, upload.single("image"), schedulePost);
postRouter.post("/generate", protect, generatePost);

export default postRouter;
