import { AuthRequest } from "../middleware/authMiddleware.js";
import { Response } from "express";
import ActivityLog from "../models/activity.js";

//get all Activity
// GET /api/activity
export const getActivity = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const activity = await ActivityLog.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("relatedPost", "content");
    res.json(activity);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
