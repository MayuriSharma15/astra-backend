import { Roadmap } from "../models/Roadmap.js";
import { getGeminiJSON } from "../services/geminiService.js";
import { logActivity } from "../services/activityService.js";

async function getOrCreateRoadmap(userId) {
  let roadmap = await Roadmap.findOne({ user: userId });
  if (!roadmap) {
    roadmap = await Roadmap.create({ user: userId });
  }
  return roadmap;
}

export async function getRoadmap(req, res) {
  try {
    const roadmap = await getOrCreateRoadmap(req.user.id);
    res.status(200).json({ roadmap });
  } catch (error) {
    res.status(500).json({ message: "Failed to load roadmap" });
  }
}

export async function generateRoadmap(req, res) {
  try {
    const { targetRole } = req.body;

    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({ message: "Target role is required" });
    }

    const prompt = `Generate a step-by-step career roadmap for someone aiming to become a "${targetRole.trim()}".
Respond with ONLY valid JSON (no markdown, no code fences) matching exactly this shape:
{
  "milestones": [
    { "title": "<short milestone name>", "description": "<one sentence on what this involves and why it matters>" }
  ]
}
Include 6 to 8 milestones, ordered logically from foundational to advanced.`;

    const result = await getGeminiJSON(prompt);

    const roadmap = await getOrCreateRoadmap(req.user.id);
    roadmap.targetRole = targetRole.trim();
    roadmap.milestones = result.milestones.map((m) => ({
      title: m.title,
      description: m.description,
      done: false,
    }));
    roadmap.generatedAt = new Date();

    await roadmap.save();

    await logActivity(
      req.user.id,
      "roadmap_generated",
      `Generated a career roadmap for: ${roadmap.targetRole}`
    );

    res.status(200).json({ roadmap });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to generate roadmap" });
  }
}

export async function toggleMilestone(req, res) {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user.id });

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    const milestone = roadmap.milestones.id(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    const wasComplete = milestone.done;
    if (typeof req.body.done === "boolean") {
      milestone.done = req.body.done;
    }

    await roadmap.save();

    if (milestone.done && !wasComplete) {
      await logActivity(
        req.user.id,
        "roadmap_milestone_completed",
        `Completed roadmap milestone: ${milestone.title}`
      );
    }

    res.status(200).json({ roadmap });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}