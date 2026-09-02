/**
 * Project Model
 * -----------------------------------------------------------------------
 * Same multi-document-per-user pattern as Goal/LearningItem — a user
 * has many projects, not one evolving document.
 * ----------------------------------------------------------------------- */

import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    link: { type: String, default: "" },
    status: {
      type: String,
      enum: ["planned", "in_progress", "completed"],
      default: "planned",
    },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);