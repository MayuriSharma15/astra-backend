/**
 * Gemini Service
 * -----------------------------------------------------------------------
 * Uses the "gemini-flash-latest" ALIAS rather than a pinned version
 * like "gemini-2.5-flash" — Google has been deprecating specific model
 * versions rapidly throughout 2026 (2.0 Flash retired June 2026, 2.5
 * Flash blocked for new accounts shortly after). The "-latest" alias
 * automatically points to whatever the current stable free-tier Flash
 * model is, so this service doesn't need a code change every time
 * Google rotates versions — Google's docs confirm this alias gets
 * "hot-swapped" on new releases with advance notice, rather than
 * breaking outright like a pinned version does.
 *
 * Key format note: Google switched Gemini API keys from the old
 * "AIza..." format to a new "AQ.Ab..." format in June 2026. The new
 * format must be sent via the "x-goog-api-key" request header, NOT as
 * a "?key=" URL query parameter (which is how the old format worked).
 * ----------------------------------------------------------------------- */

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `You are ASTRA, an AI career assistant inside the ASTRA Career Intelligence Platform.
You help users with career advice, resume guidance, interview preparation, learning paths, and career planning.
Be concise, encouraging, and practical. Give specific, actionable advice rather than generic platitudes.
Keep responses focused — a few short paragraphs at most, not long essays, unless the user asks for depth.`;

export async function getGeminiReply(messages) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env");
  }

  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.error?.message || "Gemini API request failed";
    throw new Error(errorMessage);
  }

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!reply) {
    throw new Error("Gemini returned an empty response");
  }

  return reply;
}

/**
 * getGeminiJSON
 * -----------------------------------------------------------------------
 * Single-shot (non-conversational) request that forces Gemini to respond
 * with valid JSON matching a shape we specify in the prompt, using
 * Gemini's response_mime_type config — far more reliable than asking
 * for JSON in plain text and hoping it doesn't wrap it in commentary or
 * markdown code fences.
 *
 * @param {string} prompt
 * @returns {Promise<object>} parsed JSON object
 */
export async function getGeminiJSON(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env");
  }

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        response_mime_type: "application/json",
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data?.error?.message || "Gemini API request failed";
    throw new Error(errorMessage);
  }

  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Gemini returned an empty response");
  }

  try {
    return JSON.parse(rawText);
  } catch {
    throw new Error("Gemini's response wasn't valid JSON");
  }
}