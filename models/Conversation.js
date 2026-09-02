/**
 * Conversation Model (UPGRADED — multiple conversations per user)
 * -----------------------------------------------------------------------
 * Previously: one Conversation document per user (enforced via
 * unique:true), a single endless chat thread. Now: users can have MANY
 * conversations, each with its own title — this is the real shape
 * "Persistent Career Memory" needs; a single thread doesn't let someone
 * separate "resume feedback" from "interview prep" from general
 * questions, the way ChatGPT/Claude's own chat history works.
 * ----------------------------------------------------------------------- */

import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // NOTE: unique:true intentionally REMOVED — a user now has many
      // Conversation documents, not one.
    },
    title: {
      type: String,
      default: "New Conversation",
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);