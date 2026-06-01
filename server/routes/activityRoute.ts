import { Router } from "express";
import { getActivity } from "../controllers/activityController.js";

const activityRouter = Router();

activityRouter.get("/", getActivity);

export default activityRouter;
