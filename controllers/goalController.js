/**
 * Goal Controller
 * -----------------------------------------------------------------------
 * UPDATED: now logs real activity — creating a goal logs "goal_created",
 * and marking one done (that wasn't already done) logs "goal_completed".
 * Un-checking a goal does NOT log anything — that's undoing an action,
 * not a new accomplishment worth showing in the feed.
 * ----------------------------------------------------------------------- */

import { Goal } from "../models/Goal.js";
import { logActivity } from "../services/activityService.js";

export async function getGoals(req, res) {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: 1 });
    res.status(200).json({ goals });
  } catch (error) {
    res.status(500).json({ message: "Failed to load goals" });
  }
}

export async function createGoal(req, res) {
  try {
    const { label } = req.body;
    if (!label || !label.trim()) {
      return res.status(400).json({ message: "Goal label is required" });
    }

    const goal = await Goal.create({ user: req.user.id, label: label.trim() });

    await logActivity(req.user.id, "goal_created", `Added a new goal: ${goal.label}`);

    res.status(201).json({ goal });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function updateGoal(req, res) {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const wasAlreadyDone = goal.done;

    if (typeof req.body.done === "boolean") goal.done = req.body.done;
    if (typeof req.body.label === "string" && req.body.label.trim()) {
      goal.label = req.body.label.trim();
    }

    await goal.save();

    if (goal.done && !wasAlreadyDone) {
      await logActivity(req.user.id, "goal_completed", `Completed goal: ${goal.label}`);
    }

    res.status(200).json({ goal });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function deleteGoal(req, res) {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete goal" });
  }
}