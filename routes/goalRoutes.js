/**
 * Goal Routes
 * -----------------------------------------------------------------------
 * ALL routes here require `protect` — there is no public goals endpoint,
 * goals are always scoped to a specific logged-in user.
 * Mounted at /api/goals in server.js:
 *   GET    /api/goals
 *   POST   /api/goals
 *   PATCH  /api/goals/:id
 *   DELETE /api/goals/:id
 * ----------------------------------------------------------------------- */

import express from "express";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../controllers/goalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getGoals);
router.post("/", createGoal);
router.patch("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;