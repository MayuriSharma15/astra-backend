import { Resume } from "../models/Resume.js";
import { getGeminiJSON } from "../services/geminiService.js";
import { logActivity } from "../services/activityService.js";

async function getOrCreateResume(userId) {
  let resume = await Resume.findOne({ user: userId });
  if (!resume) {
    resume = await Resume.create({ user: userId });
  }
  return resume;
}

export async function getResume(req, res) {
  try {
    const resume = await getOrCreateResume(req.user.id);
    res.status(200).json({ resume });
  } catch (error) {
    res.status(500).json({ message: "Failed to load resume" });
  }
}

export async function updateResume(req, res) {
  try {
    const resume = await getOrCreateResume(req.user.id);

    const { fullName, email, phone, summary, skills, experience, education } = req.body;

    if (fullName !== undefined) resume.fullName = fullName;
    if (email !== undefined) resume.email = email;
    if (phone !== undefined) resume.phone = phone;
    if (summary !== undefined) resume.summary = summary;
    if (skills !== undefined) resume.skills = skills;
    if (experience !== undefined) resume.experience = experience;
    if (education !== undefined) resume.education = education;

    await resume.save();
    res.status(200).json({ resume });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function reviewResume(req, res) {
  try {
    const resume = await getOrCreateResume(req.user.id);

    const experienceText = resume.experience
      .map((e) => `- ${e.title} at ${e.company} (${e.duration}): ${e.description}`)
      .join("\n") || "None listed";

    const educationText = resume.education
      .map((e) => `- ${e.degree}, ${e.school} (${e.duration})`)
      .join("\n") || "None listed";

    const prompt = `You are an expert resume reviewer. Review this resume and respond with ONLY valid JSON (no markdown, no code fences) matching exactly this shape:
{
  "score": <number 0-100>,
  "strengths": [<2-4 short strings>],
  "improvements": [<2-4 short, specific, actionable strings>],
  "summary": "<one or two sentence overall assessment>"
}

RESUME TO REVIEW:
Name: ${resume.fullName || "Not provided"}
Summary: ${resume.summary || "Not provided"}
Skills: ${resume.skills.join(", ") || "None listed"}

Experience:
${experienceText}

Education:
${educationText}`;

    const review = await getGeminiJSON(prompt);

    resume.lastReview = {
      score: review.score,
      strengths: review.strengths,
      improvements: review.improvements,
      summary: review.summary,
      reviewedAt: new Date(),
    };

    await resume.save();

    await logActivity(
      req.user.id,
      "resume_reviewed",
      `Reviewed resume — scored ${review.score}/100`
    );

    res.status(200).json({ resume });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to generate review" });
  }
}