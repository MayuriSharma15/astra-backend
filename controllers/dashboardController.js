/**
 * Dashboard Controller
 * -----------------------------------------------------------------------
 * UPDATED: learningProgressPercent is now REAL — average of all the
 * user's LearningItem percentages, null if they have no items yet
 * (so the Overview stat shows "--" / "Coming soon" honestly rather
 * than "0%", same reasoning as Resume Score before any review).
 * ----------------------------------------------------------------------- */

import { Goal } from "../models/Goal.js";
import { Resume } from "../models/Resume.js";
import { LearningItem } from "../models/LearningItem.js";

export async function getDashboardSummary(req, res) {
  try {
    const userId = req.user.id;

    const [goals, resume, learningItems] = await Promise.all([
      Goal.find({ user: userId }),
      Resume.findOne({ user: userId }),
      LearningItem.find({ user: userId }),
    ]);

    const goalsTotal = goals.length;
    const goalsCompleted = goals.filter((g) => g.done).length;
    const goalsActive = goalsTotal - goalsCompleted;

    const resumeScore = resume?.lastReview?.score ?? null;

    const learningProgressPercent =
      learningItems.length > 0
        ? Math.round(
            learningItems.reduce((sum, item) => sum + item.percent, 0) / learningItems.length
          )
        : null;

    res.status(200).json({
      resumeScore,
      goalsActive,
      goalsTotal,
      goalsCompleted,
      mockInterviewsCompleted: 0, // still honestly not built yet
      learningProgressPercent,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard summary" });
  }
}