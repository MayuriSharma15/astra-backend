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
