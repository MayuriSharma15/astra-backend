import { API_BASE_URL } from "../config/api";

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getLatestSession(token) {
  const response = await fetch(`${API_BASE_URL}/interview/latest`, {
    headers: authHeaders(token),
  });
  return handleResponse(response);
}

export async function startInterview(token, targetRole) {
  const response = await fetch(`${API_BASE_URL}/interview/start`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ targetRole }),
  });
  return handleResponse(response);
}

export async function submitAnswer(token, sessionId, questionIndex, answer) {
  const response = await fetch(`${API_BASE_URL}/interview/${sessionId}/answer`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ questionIndex, answer }),
  });
  return handleResponse(response);
}