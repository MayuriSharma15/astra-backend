/**
 * LearningItem Model
 * -----------------------------------------------------------------------
 * A course/topic the user is tracking progress on. `percent` is
 * user-updated manually (0-100) — there's no integration with a real
 * course provider yet, so progress is self-reported, same honest
 * approach as everything else that isn't backed by a real external
 * system yet.
 * ----------------------------------------------------------------------- */

import mongoose from "mongoose";

const learningItemSchema = new mongoose.Schema(
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
    percent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

export const LearningItem = mongoose.model("LearningItem", learningItemSchema);