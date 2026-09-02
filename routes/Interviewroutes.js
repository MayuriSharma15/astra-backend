import express from "express";
import { getLatestSession, startInterview, submitAnswer } from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/latest", getLatestSession);
router.post("/start", startInterview);
router.post("/:id/answer", submitAnswer);

export default router;