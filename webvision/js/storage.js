import { sanitizeText } from "./business-rules.js";
import { getAttribution } from "./analytics.js";

const STORAGE_KEY = "ixmati_webvision_session";
const LEADS_KEY = "ixmati_webvision_leads";

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : createSession();
  } catch (error) {
    return createSession();
  }
}

export function saveSession(session) {
  const clean = {
    ...session,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch (error) {
    // Safari can block storage in constrained contexts; the wizard must keep running.
  }
  return clean;
}

export function createSession() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `wv-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attribution: getAttribution(),
    progress: "started",
    answers: {},
    selectedFeatureIds: [],
    recommendation: null,
    actions: []
  };
}

export function captureLead(session, progress) {
  const answers = session.answers || {};
  if (!answers.businessName || (!answers.whatsapp && !answers.email) || !answers.businessType) return session;

  const lead = {
    sessionId: session.id,
    date: new Date().toISOString(),
    progress,
    businessName: sanitizeText(answers.businessName, 80),
    businessType: sanitizeText(answers.businessType, 80),
    whatsapp: sanitizeText(answers.whatsapp, 30),
    email: sanitizeText(answers.email, 120),
    attribution: session.attribution,
    answers,
    recommendation: session.recommendation
  };

  try {
    const existing = readLeads().filter((item) => item.sessionId !== session.id);
    existing.push(lead);
    localStorage.setItem(LEADS_KEY, JSON.stringify(existing.slice(-80)));
  } catch (error) {
    return session;
  }
  return session;
}

export function readLeads() {
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

export async function sendToServer(session, actionFinal = "") {
  try {
    const response = await fetch("/api/webvision/generate/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...session, actionFinal })
    });
    if (!response.ok) throw new Error("Server response failed");
    return await response.json();
  } catch (error) {
    return { ok: false, fallback: "localStorage" };
  }
}
