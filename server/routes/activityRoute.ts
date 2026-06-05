import { Router } from "express";
import { getActivity } from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const activityRouter = Router();

activityRouter.get("/", protect, getActivity);

export default activityRouter;
