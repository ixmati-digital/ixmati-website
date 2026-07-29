const EVENT_PREFIX = "webvision_";

export const WEBVISION_EVENTS = [
  "webvision_started",
  "business_info_completed",
  "branding_completed",
  "requirements_completed",
  "simulation_generated",
  "recommendation_viewed",
  "feature_added",
  "feature_removed",
  "consultation_requested",
  "purchase_intent",
  "diagnosis_requested",
  "webvision_abandoned"
];

export function trackEvent(name, payload = {}) {
  if (!WEBVISION_EVENTS.includes(name)) return;
  const eventPayload = {
    product: "Ixmati Web Vision",
    at: new Date().toISOString(),
    ...payload
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...eventPayload });

  if (window.gtag) window.gtag("event", name.replace(EVENT_PREFIX, ""), eventPayload);
  if (window.fbq) window.fbq("trackCustom", name, eventPayload);

  document.dispatchEvent(new CustomEvent(name, { detail: eventPayload }));
}

export function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    origin: params.get("origen") || params.get("source") || document.referrer || "direct",
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || ""
  };
}
