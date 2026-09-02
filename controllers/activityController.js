/**
 * Activity Controller
 * -----------------------------------------------------------------------
 * Read-only — activities are only ever created via logActivity() calls
 * inside other controllers, never directly through this endpoint.
 * ----------------------------------------------------------------------- */

import { Activity } from "../models/Activity.js";

/** GET /api/activity — most recent activity, newest first */
export async function getRecentActivity(req, res) {
  try {
    const activities = await Activity.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ activities });
  } catch (error) {
    res.status(500).json({ message: "Failed to load activity" });
  }
}