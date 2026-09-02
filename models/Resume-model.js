/**
 * Resume Model
 * -----------------------------------------------------------------------
 * One resume per user, implemented via application logic (get-or-create
 * in the controller) rather than a schema-level unique index — the
 * Conversation model's unique:true caused a real bug earlier when we
 * needed to change that constraint later. Avoiding the same mistake here
 * by keeping "one per user" as a business rule enforced in code, not a
 * DB-level constraint that's painful to remove later.
 *
 * lastReview stores the most recent AI review — score + structured
 * feedback — so it persists and doesn't need re-generating every time
 * the user revisits the page.
 * ----------------------------------------------------------------------- */

import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    company: { type: String, default: "" },
    duration: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: true }
);

const educationSchema = new mongoose.Schema(
  {
    school: { type: String, default: "" },
    degree: { type: String, default: "" },
    duration: { type: String, default: "" },
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    score: Number,
    strengths: [String],
    improvements: [String],
    summary: String,
    reviewedAt: Date,
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    summary: { type: String, default: "" },
    skills: { type: [String], default: [] },
    experience: { type: [experienceSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    lastReview: reviewSchema,
  },
  { timestamps: true }
);

export const Resume = mongoose.model("Resume", resumeSchema);