import { Conversation } from "../models/Conversation.js";
import { getGeminiReply } from "../services/geminiService.js";
import { logActivity } from "../services/activityService.js";

function makeTitleFromMessage(content) {
  const trimmed = content.trim();
  return trimmed.length > 40 ? `${trimmed.slice(0, 40)}...` : trimmed;
}

async function getOrCreateConversation(userId) {
  let conversation = await Conversation.findOne({ user: userId });
  if (!conversation) {
    conversation = await Conversation.create({ user: userId, messages: [] });
  }
  return conversation;
}

export async function listConversations(req, res) {
  try {
    const conversations = await Conversation.find({ user: req.user.id })
      .select("title updatedAt createdAt")
      .sort({ updatedAt: -1 });
    res.status(200).json({ conversations });
  } catch (error) {
    res.status(500).json({ message: "Failed to load conversations" });
  }
}

export async function createConversation(req, res) {
  try {
    const conversation = await Conversation.create({ user: req.user.id, messages: [] });
    res.status(201).json({ conversation });
  } catch (error) {
    res.status(500).json({ message: "Failed to create conversation" });
  }
}

export async function getConversationById(req, res) {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json({ conversation });
  } catch (error) {
    res.status(500).json({ message: "Failed to load conversation" });
  }
}

export async function sendMessageToConversation(req, res) {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isFirstMessage = conversation.messages.length === 0;

    conversation.messages.push({ role: "user", content: content.trim() });

    if (isFirstMessage) {
      conversation.title = makeTitleFromMessage(content);
    }

    const historyForGemini = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const replyText = await getGeminiReply(historyForGemini);
    conversation.messages.push({ role: "assistant", content: replyText });

    await conversation.save();

    if (isFirstMessage) {
      await logActivity(req.user.id, "chat_started", `Started a conversation: ${conversation.title}`);
    }

    res.status(200).json({ conversation });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to get AI response" });
  }
}

export async function deleteConversation(req, res) {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete conversation" });
  }
}