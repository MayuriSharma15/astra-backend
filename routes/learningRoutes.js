import express from "express";
import {
  getLearningItems,
  createLearningItem,
  updateLearningItem,
  deleteLearningItem,
} from "../controllers/learningController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getLearningItems);
router.post("/", createLearningItem);
router.patch("/:id", updateLearningItem);
router.delete("/:id", deleteLearningItem);

export default router;