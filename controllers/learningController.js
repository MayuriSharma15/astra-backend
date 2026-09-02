import { LearningItem } from "../models/LearningItem.js";
import { logActivity } from "../services/activityService.js";

export async function getLearningItems(req, res) {
  try {
    const items = await LearningItem.find({ user: req.user.id }).sort({ createdAt: 1 });
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: "Failed to load learning items" });
  }
}

export async function createLearningItem(req, res) {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    const item = await LearningItem.create({ user: req.user.id, title: title.trim() });

    await logActivity(req.user.id, "learning_started", `Started learning: ${item.title}`);

    res.status(201).json({ item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function updateLearningItem(req, res) {
  try {
    const item = await LearningItem.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const wasComplete = item.percent >= 100;

    if (typeof req.body.percent === "number") {
      item.percent = Math.max(0, Math.min(100, req.body.percent));
    }
    if (typeof req.body.title === "string" && req.body.title.trim()) {
      item.title = req.body.title.trim();
    }

    await item.save();

    if (item.percent >= 100 && !wasComplete) {
      await logActivity(req.user.id, "learning_completed", `Completed: ${item.title}`);
    }

    res.status(200).json({ item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function deleteLearningItem(req, res) {
  try {
    const item = await LearningItem.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item" });
  }
}