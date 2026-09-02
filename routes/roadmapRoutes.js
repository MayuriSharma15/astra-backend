import express from "express";
import { getRoadmap, generateRoadmap, toggleMilestone } from "../controllers/roadmapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getRoadmap);
router.post("/generate", generateRoadmap);
router.patch("/milestones/:milestoneId", toggleMilestone);

export default router;