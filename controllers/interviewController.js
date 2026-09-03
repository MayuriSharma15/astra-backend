/**
 * Interview Controller
 * -----------------------------------------------------------------------
 * startInterview generates real, role-specific questions via Gemini.
 * submitAnswer sends the SPECIFIC question + the user's answer back to
 * Gemini for real, individualized feedback and a score — not a generic
 * "good job" response.
 * ----------------------------------------------------------------------- */

import { InterviewSession } from "../models/InterviewSession.js";
import { getGeminiJSON } from "../services/geminiService.js";
import { logActivity } from "../services/activityService.js";

/** GET /api/interview/latest — most recent session, or null if none yet */
export async function getLatestSession(req, res) {
  try {
    const session = await InterviewSession.findOne({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ session: session ?? null });
  } catch (error) {
    res.status(500).json({ message: "Failed to load interview session" });
  }
}

/** POST /api/interview/start — body: { targetRole } */
export async function startInterview(req, res) {
  try {
    const { targetRole } = req.body;

    if (!targetRole || !targetRole.trim()) {
      return res.status(400).json({ message: "Target role is required" });
    }

    const prompt = `Generate 5 realistic mock interview questions for someone interviewing for a "${targetRole.trim()}" role.
Include a mix of behavioral and role-specific technical/practical questions.
Respond with ONLY valid JSON (no markdown, no code fences) matching exactly this shape:
{ "questions": ["<question 1>", "<question 2>", "<question 3>", "<question 4>", "<question 5>"] }`;

    const result = await getGeminiJSON(prompt);

    const session = await InterviewSession.create({
      user: req.user.id,
      targetRole: targetRole.trim(),
      questions: result.questions.map((q) => ({ question: q })),
    });

    await logActivity(
      req.user.id,
      "interview_started",
      `Started mock interview practice for: ${session.targetRole}`
    );

    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to start interview" });
  }
}

/** POST /api/interview/:id/answer — body: { questionIndex, answer } */
export async function submitAnswer(req, res) {
  try {
    const { questionIndex, answer } = req.body;

    if (typeof questionIndex !== "number" || !answer || !answer.trim()) {
      return res.status(400).json({ message: "questionIndex and answer are required" });
    }

    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user.id });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    const questionDoc = session.questions[questionIndex];
    if (!questionDoc) {
      return res.status(400).json({ message: "Invalid question index" });
    }

    const prompt = `You are an expert interview coach. The candidate is interviewing for a "${session.targetRole}" role.

Question asked: "${questionDoc.question}"
Candidate's answer: "${answer.trim()}"

Evaluate this answer. Respond with ONLY valid JSON (no markdown, no code fences) matching exactly this shape:
{
  "score": <number 0-100>,
  "feedback": "<2-3 sentences of specific, constructive feedback on this answer — what was good, what to improve>"
}`;

    const evaluation = await getGeminiJSON(prompt);

    questionDoc.answer = answer.trim();
    questionDoc.feedback = evaluation.feedback;
    questionDoc.score = evaluation.score;

    await session.save();

    const allAnswered = session.questions.every((q) => q.answer);
    if (allAnswered) {
      await logActivity(
        req.user.id,
        "interview_completed",
        `Completed mock interview practice for: ${session.targetRole}`
      );
    }

    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to evaluate answer" });
  }
}
