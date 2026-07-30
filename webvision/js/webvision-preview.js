import { buildRecommendation } from "./recommendation-engine.js";
import { inferRequiredFeatures } from "./business-rules.js";
import { renderSimulation } from "./simulation.js";

export function renderLivePreview(mount, answers, selectedFeatureIds = [], excludedFeatureIds = []) {
  if (!mount) return null;
  const featureIds = selectedFeatureIds.length ? selectedFeatureIds : inferRequiredFeatures(answers);
  const recommendation = buildRecommendation(answers, featureIds, excludedFeatureIds);
  renderSimulation(mount, answers, recommendation);
  return recommendation;
}

export function renderVisionPreview(mount, answers, recommendation) {
  if (!mount || !recommendation) return;
  renderSimulation(mount, answers, recommendation);
}

export function setDeviceView(mount, device) {
  if (!mount) return;
  mount.classList.toggle("is-mobile", device === "mobile");
  mount.classList.toggle("is-tablet", device === "tablet");
  mount.classList.toggle("is-desktop", device === "desktop");
}
