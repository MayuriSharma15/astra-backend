/**
 * Activity Service
 * -----------------------------------------------------------------------
 * Central helper so every controller logs activity the SAME way — one
 * function call, rather than each controller constructing Activity
 * documents by hand with slightly different shapes. Failures here are
 * swallowed (logged to console, not thrown) — a failed activity log
 * should never break the actual feature action that triggered it (e.g.
 * a goal should still save even if logging the activity entry fails).
 * ----------------------------------------------------------------------- */

import { Activity } from "../models/Activity.js";

export async function logActivity(userId, type, text) {
  try {
    await Activity.create({ user: userId, type, text });
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
}