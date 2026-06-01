import express from "express";
import {
  getOAuthURL,
  syncAccounts,
} from "../controllers/socialAuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const socialAuthRouter = express.Router();

socialAuthRouter.get("/:platform/url", protect, getOAuthURL);
socialAuthRouter.get("/sync", protect, syncAccounts);

export default socialAuthRouter;
