/**
 * Goal Model
 * -----------------------------------------------------------------------
 * Each goal belongs to exactly one user (the `user` field is a reference
 * to that User's _id). Every query in the controller filters by
 * req.user.id — this is what guarantees one user can never see or edit
 * another user's goals, even if they guess a goal's ID.
 * ----------------------------------------------------------------------- */

import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      required: [true, "Goal label is required"],
      trim: true,
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Goal = mongoose.model("Goal", goalSchema);