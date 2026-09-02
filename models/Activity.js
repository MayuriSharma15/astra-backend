import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "goal_created",
        "goal_completed",
        "resume_reviewed",
        "learning_started",
        "learning_completed",
        "chat_started",
        "roadmap_generated",
        "roadmap_milestone_completed",
        "interview_started",
        "interview_completed",
        "project_created",
        "project_completed",
      ],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Activity = mongoose.model("Activity", activitySchema);