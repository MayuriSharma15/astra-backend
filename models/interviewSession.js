/**
 * InterviewSession Model
 * -----------------------------------------------------------------------
 * Each "Start Practice" creates a NEW session (unlike Resume/Roadmap,
 * which are one evolving document per user) — a mock interview session
 * is a discrete practice attempt, and someone practicing for "Frontend
 * Developer" today and "Backend Developer" next week should get two
 * separate records, not one overwritten document.
 *
 * Each question stores its own answer + AI feedback + score once
 * answered — questions start with answer/feedback/score all empty/null.
 * ----------------------------------------------------------------------- */

import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    feedback: { type: String, default: "" },
    score: { type: Number, default: null },
  },
  { timestamps: true }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetRole: { type: String, required: true },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

export const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
