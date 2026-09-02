import { Project } from "../models/Project.js";
import { logActivity } from "../services/activityService.js";

export async function getProjects(req, res) {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Failed to load projects" });
  }
}

export async function createProject(req, res) {
  try {
    const { title, description, techStack, link } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const project = await Project.create({
      user: req.user.id,
      title: title.trim(),
      description: description || "",
      techStack: techStack || [],
      link: link || "",
    });

    await logActivity(req.user.id, "project_created", `Added a new project: ${project.title}`);

    res.status(201).json({ project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function updateProject(req, res) {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const wasCompleted = project.status === "completed";

    const { title, description, techStack, link, status } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (techStack !== undefined) project.techStack = techStack;
    if (link !== undefined) project.link = link;
    if (status !== undefined) project.status = status;

    await project.save();

    if (project.status === "completed" && !wasCompleted) {
      await logActivity(req.user.id, "project_completed", `Completed project: ${project.title}`);
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function deleteProject(req, res) {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete project" });
  }
}