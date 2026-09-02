/**
 * Chat Routes (UPGRADED for multi-conversation support)
 * -----------------------------------------------------------------------
 * Mounted at /api/chat:
 *   GET    /api/chat/conversations           — list all (sidebar)
 *   POST   /api/chat/conversations           — create new
 *   GET    /api/chat/conversations/:id        — one conversation, full messages
 *   POST   /api/chat/conversations/:id/message — send message, get AI reply
 *   DELETE /api/chat/conversations/:id        — delete
 * ----------------------------------------------------------------------- */

import express from "express";
import {
  listConversations,
  createConversation,
  getConversationById,
  sendMessageToConversation,
  deleteConversation,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/conversations", listConversations);
router.post("/conversations", createConversation);
router.get("/conversations/:id", getConversationById);
router.post("/conversations/:id/message", sendMessageToConversation);
router.delete("/conversations/:id", deleteConversation);

export default router;