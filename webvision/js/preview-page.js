import { buildRecommendation } from "./recommendation-engine.js";
import { renderSimulation } from "./simulation.js";
import { loadSession } from "./storage.js";

const session = loadSession();
const answers = session.answers || {};
const selectedFeatureIds = session.selectedFeatureIds || [];
const excludedFeatureIds = session.excludedFeatureIds || [];
const recommendation = session.recommendation || buildRecommendation(answers, selectedFeatureIds, excludedFeatureIds);

renderSimulation(document.querySelector("#fullPreviewMount"), answers, recommendation, { fullPage: true });
