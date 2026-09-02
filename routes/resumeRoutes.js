/**
 * Resume Routes
 * -----------------------------------------------------------------------
 * Mounted at /api/resume:
 *   GET  /api/resume         — get (or auto-create) this user's resume
 *   PUT  /api/resume         — save all fields
 *   POST /api/resume/review  — trigger a fresh AI review
 * ----------------------------------------------------------------------- */

import express from "express";
import { getResume, updateResume, reviewResume } from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getResume);
router.put("/", updateResume);
router.post("/review", reviewResume);

export default router;