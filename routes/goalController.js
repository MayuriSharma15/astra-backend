/**
 * Goal Controller
 * -----------------------------------------------------------------------
 * All four endpoints filter by { user: req.user.id } — req.user is only
 * available because these routes sit behind the `protect` middleware,
 * which verifies the JWT and attaches the real logged-in user before
 * any of these functions run.
 * ----------------------------------------------------------------------- */

import { Goal } from "../models/Goal.js";

/** GET /api/goals — all goals belonging to the logged-in user */
export async function getGoals(req, res) {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: 1 });
    res.status(200).json({ goals });
  } catch (error) {
    res.status(500).json({ message: "Failed to load goals" });
  }
}

/** POST /api/goals — create a new goal for the logged-in user */
export async function createGoal(req, res) {
  try {
    const { label } = req.body;
    if (!label || !label.trim()) {
      return res.status(400).json({ message: "Goal label is required" });
    }

    const goal = await Goal.create({ user: req.user.id, label: label.trim() });
    res.status(201).json({ goal });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

/** PATCH /api/goals/:id — toggle done state (or edit label) */
export async function updateGoal(req, res) {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (typeof req.body.done === "boolean") goal.done = req.body.done;
    if (typeof req.body.label === "string" && req.body.label.trim()) {
      goal.label = req.body.label.trim();
    }

    await goal.save();
    res.status(200).json({ goal });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

/** DELETE /api/goals/:id */
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