import { PRICING_CONFIG } from "../config/pricing.js";
import { buildRecommendation } from "./recommendation-engine.js";
import { inferRequiredFeatures, sanitizeText } from "./business-rules.js";
import { formatMoney } from "./pricing-engine.js";
import { captureLead, loadSession, saveSession, sendToServer } from "./storage.js";
import { trackEvent } from "./analytics.js";
import { runIntro } from "./webvision-intro.js";
import { transitionScene } from "./webvision-transitions.js";
import { animatePriceChange, animatePriceCounter, animateStartTransition, celebrateReveal, initMotionFX, pulseSelection, revealSimulation, runGenerationVisual } from "./webvision-motion.js";
import { initImmersiveAudio, playCue } from "./webvision-audio.js";
import { initLivingBackground } from "./webvision-background.js";
import { loadOptionalFonts } from "./webvision-fonts.js";
import { renderLivePreview as renderPreview, renderVisionPreview, setDeviceView } from "./webvision-preview.js";
import { FEATURE_QUESTIONS, FONT_OPTIONS, GENERATION_MESSAGES, OBJECTIVES, SCREENS, STEP_LABELS } from "./webvision-wizard.js";

let session = loadSession();
let current = Math.max(0, SCREENS.indexOf(session.currentScreen || "welcome"));
let selectedFeatureIds = session.selectedFeatureIds?.length ? session.selectedFeatureIds : [];
let excludedFeatureIds = session.excludedFeatureIds?.length ? session.excludedFeatureIds : [];
let featureQuestionIndex = 0;

const form = document.querySelector("#webvisionForm");
const screens = Array.from(document.querySelectorAll(".wv-screen"));
const nextBtn = document.querySelector("#nextBtn");
const backBtn = document.querySelector("#backBtn");
const progressFill = document.querySelector("#progressFill");
const progressText = document.querySelector("#progressText");
const progressCount = document.querySelector("#progressCount");
const stepList = document.querySelector("#stepList");
const liveBrandName = document.querySelector("#liveBrandName");
const livePreviewMount = document.querySelector("#livePreviewMount");

init();

function init() {
  renderStepList();
  renderObjectives();
  renderFontSelector();
  renderFeatureDeck();
  hydrateForm();
  bindEvents();
  updateConditionals();
  showScreen(current);
  initLivingBackground();
  initImmersiveAudio(document.querySelector("#immersiveToggle"));
  loadOptionalFonts();
  runIntro({ onReady: initMotionFX });
  renderLivePreview();
}

function bindEvents() {
  document.querySelector("[data-action='start']").addEventListener("click", () => {
    trackEvent("webvision_started", { sessionId: session.id });
    animateStartTransition(() => goTo(1));
  });

  nextBtn.addEventListener("click", next);
  backBtn.addEventListener("click", back);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    next();
  });

  form.addEventListener("input", () => {
    collectAnswers();
    updateConditionals();
    syncVisualState();
    renderLivePreview();
    persist("input");
  });

  form.addEventListener("change", async (event) => {
    if (event.target.name === "logo") await handleLogo(event.target.files[0]);
    if (["primaryColor", "accentColor"].includes(event.target.name)) {
      trackEvent("color_changed", { sessionId: session.id, field: event.target.name });
    }
    collectAnswers();
    updateConditionals();
    syncVisualState(event.target);
    renderLivePreview();
    persist("change");
  });

  document.querySelectorAll("[data-style-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      form.elements.visualStyle.value = button.dataset.styleChoice;
      syncVisualState(button);
      collectAnswers();
      renderLivePreview();
      persist("style_selected");
      trackEvent("style_changed", { sessionId: session.id, style: button.dataset.styleChoice });
      pulseSelection(button);
    });
  });

  document.querySelector("#featureDeck")?.addEventListener("click", (event) => {
    const action = event.target.closest("[data-feature-answer]")?.dataset.featureAnswer;
    const backFeature = event.target.closest("[data-feature-back]");
    if (backFeature) {
      featureQuestionIndex = Math.max(0, featureQuestionIndex - 1);
      renderFeatureDeck();
      return;
    }
    if (!action) return;
    const fieldName = FEATURE_QUESTIONS[featureQuestionIndex]?.[0];
    const field = form.elements[fieldName];
    if (field) field.checked = action === "yes";
    if (fieldName === "hasProducts" && action === "no") form.elements.productCount.value = 0;
    featureQuestionIndex = Math.min(FEATURE_QUESTIONS.length, featureQuestionIndex + 1);
    collectAnswers();
    syncVisualState(event.target);
    renderFeatureDeck();
    renderLivePreview();
    persist("feature_answered");
  });

  document.querySelectorAll("[data-device]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-device]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      setDeviceView(document.querySelector("#simulationMount"), button.dataset.device);
      trackEvent("preview_device_changed", { sessionId: session.id, device: button.dataset.device });
    });
  });

  document.querySelector("[data-action='open-preview']").addEventListener("click", () => {
    collectAnswers();
    session.recommendation = buildRecommendation(session.answers, selectedFeatureIds, excludedFeatureIds);
    persist("open_full_preview");
    window.open("./preview.html", "_blank", "noopener,noreferrer");
  });

  document.querySelector("[data-action='show-diagnosis']")?.addEventListener("click", () => {
    playCue("whoosh");
    goTo(SCREENS.indexOf("diagnosis"));
  });

  document.querySelectorAll("[data-final-action]").forEach((button) => {
    button.addEventListener("click", () => finish(button.dataset.finalAction));
  });

  window.addEventListener("beforeunload", () => {
    if (current > 0 && current < SCREENS.length - 1) {
      trackEvent("webvision_abandoned", { sessionId: session.id, progress: SCREENS[current] });
    }
  });
}

function next() {
  playCue("whoosh");
  clearErrors();
  if (!validateCurrent()) return;
  collectAnswers();
  trackEvent("scene_completed", { sessionId: session.id, scene: SCREENS[current] });

  if (SCREENS[current] === "contact") trackEvent("business_info_completed", { sessionId: session.id });
  if (SCREENS[current] === "brand") trackEvent("branding_completed", { sessionId: session.id });
  if (SCREENS[current] === "contact") {
    trackEvent("requirements_completed", { sessionId: session.id });
    runGeneration();
    return;
  }

  goTo(Math.min(SCREENS.length - 1, current + 1));
}

function back() {
  playCue("click");
  let target = Math.max(0, current - 1);
  if (SCREENS[target] === "generating") target -= 1;
  goTo(target);
}

function showScreen(index) {
  activateScreen(index);
}

function goTo(index) {
  const from = screens[current];
  const to = screens[index];
  transitionScene({
    from,
    to,
    done: () => activateScreen(index)
  });
}

function activateScreen(index) {
  current = index;
  screens.forEach((screen, screenIndex) => screen.classList.toggle("is-active", screenIndex === current));
  const screen = SCREENS[current];
  document.querySelector(".wv-app").dataset.step = screen;
  backBtn.hidden = current === 0;
  nextBtn.hidden = ["welcome", "generating", "conversion"].includes(screen);
  nextBtn.textContent = screen === "vision" ? "Ver diagnóstico" : screen === "diagnosis" ? "Elegir siguiente paso" : "Continuar";
  updateProgress();
  persist("screen");
  if (screen === "diagnosis") {
    renderDiagnosis();
    trackEvent("recommendation_viewed", { sessionId: session.id });
  }
  if (screen === "vision") {
    renderVision();
    revealSimulation();
  }
  renderLivePreview();
}

function updateProgress() {
  const flowIndex = Math.max(0, Math.min(8, current));
  const percent = Math.round((flowIndex / 8) * 100);
  progressFill.style.width = `${percent}%`;
  progressText.textContent = current > 0 && current < 9 ? `${String(current).padStart(2, "0")} / 08` : STEP_LABELS[current] || "Web Vision";
  progressCount.textContent = current > 0 && current < 9 ? `${String(current).padStart(2, "0")}` : `${percent}%`;
  Array.from(stepList.children).forEach((item, index) => item.classList.toggle("is-active", index === current));
}

function renderStepList() {
  stepList.innerHTML = STEP_LABELS.map((label) => `<li>${label}</li>`).join("");
}

function renderObjectives() {
  const mount = document.querySelector("[data-checkbox-group='objectives']");
  mount.innerHTML = OBJECTIVES.map(([value, label]) => `
    <label class="wv-option">
      <input type="checkbox" name="objectives" value="${value}">
      <span>${label}</span>
    </label>
  `).join("");
  mount.addEventListener("change", () => {
    mount.querySelectorAll(".wv-option").forEach((label) => {
      label.classList.toggle("is-selected", label.querySelector("input").checked);
    });
  });
}

function renderFeatureDeck() {
  const mount = document.querySelector("#featureDeck");
  if (!mount) return;
  const done = featureQuestionIndex >= FEATURE_QUESTIONS.length;
  if (done) {
    mount.innerHTML = `
      <article class="wv-feature-card">
        <small>Funciones listas</small>
        <h3>Ya tenemos la base funcional.</h3>
        <p>Si necesitas algo especial, déjalo aquí y lo consideramos en la recomendación.</p>
        <textarea data-special-feature maxlength="260" placeholder="Función especial opcional">${form.elements.specialFeature.value || ""}</textarea>
        <button class="wv-button wv-button-ghost" type="button" data-feature-back>Revisar anterior</button>
      </article>
    `;
    mount.querySelector("[data-special-feature]").addEventListener("input", (event) => {
      form.elements.specialFeature.value = event.target.value;
      collectAnswers();
      renderLivePreview();
      persist("special_feature");
    });
    return;
  }
  const [fieldName, question] = FEATURE_QUESTIONS[featureQuestionIndex];
  const checked = Boolean(form.elements[fieldName]?.checked);
  mount.innerHTML = `
    <article class="wv-feature-card">
      <small>${String(featureQuestionIndex + 1).padStart(2, "0")} / ${String(FEATURE_QUESTIONS.length).padStart(2, "0")}</small>
      <h3>${question}</h3>
      ${fieldName === "hasProducts" && checked ? `<label class="wv-product-count">Cantidad aproximada<input data-product-count-visual type="number" min="0" max="5000" value="${form.elements.productCount.value || 0}"></label>` : ""}
      <div class="wv-feature-actions">
        <button type="button" data-feature-answer="yes" class="${checked ? "is-active" : ""}">Sí</button>
        <button type="button" data-feature-answer="no" class="${!checked ? "is-active" : ""}">No</button>
      </div>
      ${featureQuestionIndex > 0 ? `<button class="wv-button wv-button-ghost" type="button" data-feature-back>Anterior</button>` : ""}
    </article>
  `;
  mount.querySelector("[data-product-count-visual]")?.addEventListener("input", (event) => {
    form.elements.productCount.value = event.target.value;
    collectAnswers();
    renderLivePreview();
  });
}

function renderFontSelector() {
  const menu = document.querySelector("#fontMenu");
  const trigger = document.querySelector(".wv-font-trigger");
  const hiddenInput = form.elements.typography;
  const preview = document.querySelector("#fontPreviewText");
  const selectedName = document.querySelector("#fontSelectedName");
  const selectedTone = document.querySelector("#fontSelectedTone");

  menu.innerHTML = FONT_OPTIONS.map(([name, tone, family]) => `
    <button type="button" data-font-name="${name}" data-font-family="${family}" data-font-tone="${tone}" style="font-family:${family}">
      <span>${name}</span>
      <small>${tone}</small>
    </button>
  `).join("");

  const applyFont = (name, tone, family, commit = false) => {
    preview.style.fontFamily = family;
    selectedName.textContent = name;
    selectedTone.textContent = tone;
    trigger.style.fontFamily = family;
    if (commit) {
      hiddenInput.value = name;
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      collectAnswers();
      persist("typography_selected");
    }
  };

  trigger.addEventListener("click", () => {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    menu.hidden = expanded;
    trigger.setAttribute("aria-expanded", String(!expanded));
  });

  menu.querySelectorAll("button").forEach((button) => {
    button.addEventListener("mouseenter", () => applyFont(button.dataset.fontName, button.dataset.fontTone, button.dataset.fontFamily));
    button.addEventListener("focus", () => applyFont(button.dataset.fontName, button.dataset.fontTone, button.dataset.fontFamily));
    button.addEventListener("click", () => applyFont(button.dataset.fontName, button.dataset.fontTone, button.dataset.fontFamily, true));
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".wv-font-field")) return;
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  });
}

function validateCurrent() {
  const active = screens[current];
  const screen = SCREENS[current];
  if (screen === "businessName" && !form.elements.businessName.value.trim()) {
    showError(form.elements.businessName.closest("label"), "Escribe el nombre para construir la vista previa.");
    form.elements.businessName.focus();
    return false;
  }
  if (screen === "businessType" && !new FormData(form).get("businessType")) {
    showError(active.querySelector(".wv-business-types"), "Selecciona el tipo de negocio.");
    return false;
  }
  if (screen === "offer" && !form.elements.mainProducts.value.trim() && !form.elements.description.value.trim()) {
    showError(form.elements.mainProducts.closest("label"), "Cuéntanos qué vendes o qué servicio ofreces.");
    form.elements.mainProducts.focus();
    return false;
  }
  if (screen === "contact") {
    const answers = collectAnswers();
    if (!answers.whatsapp && !answers.email) {
      showError(active.querySelector("[name='whatsapp']").closest("label"), "Agrega WhatsApp o correo para guardar tu diagnóstico.");
      return false;
    }
  }
  const required = Array.from(active.querySelectorAll("[required]"));
  const invalid = required.find((field) => !String(field.value || "").trim());
  if (invalid) {
    invalid.focus();
    showError(invalid.closest("label") || active, "Completa este dato para continuar.");
    return false;
  }
  return true;
}

function showError(target, message) {
  const error = document.createElement("span");
  error.className = "wv-error";
  error.setAttribute("role", "alert");
  error.textContent = message;
  target.appendChild(error);
}

function clearErrors() {
  document.querySelectorAll(".wv-error").forEach((item) => item.remove());
}

function collectAnswers() {
  const data = new FormData(form);
  const answers = {};
  for (const [key, value] of data.entries()) {
    if (key === "logo") continue;
    if (key === "objectives") {
      answers.objectives = answers.objectives || [];
      answers.objectives.push(value);
      continue;
    }
    const field = form.elements[key];
    if (field?.type === "checkbox") {
      answers[key] = field.checked;
    } else {
      answers[key] = typeof value === "string" ? sanitizeText(value, key === "description" ? 420 : 220) : value;
    }
  }
  form.querySelectorAll("input[type='checkbox']:not([name='objectives'])").forEach((field) => {
    answers[field.name] = field.checked;
  });
  answers.objectives = answers.objectives || [];
  if (session.answers.logoDataUrl) answers.logoDataUrl = session.answers.logoDataUrl;
  session.answers = answers;
  return answers;
}

function hydrateForm() {
  const answers = session.answers || {};
  Object.entries(answers).forEach(([key, value]) => {
    if (key === "logoDataUrl") return;
    if (key === "objectives") {
      value.forEach((objective) => {
        const input = form.querySelector(`[name="objectives"][value="${objective}"]`);
        if (input) {
          input.checked = true;
          input.closest(".wv-option")?.classList.add("is-selected");
        }
      });
      return;
    }
    const field = form.elements[key];
    if (!field) return;
    if (field.type === "checkbox") field.checked = Boolean(value);
    else field.value = value;
  });
  const fontOption = FONT_OPTIONS.find(([name]) => name === answers.typography) || FONT_OPTIONS[0];
  document.querySelector("#fontSelectedName").textContent = fontOption[0];
  document.querySelector("#fontSelectedTone").textContent = fontOption[1];
  document.querySelector("#fontPreviewText").style.fontFamily = fontOption[2];
  document.querySelector(".wv-font-trigger").style.fontFamily = fontOption[2];
  syncVisualState();
}

function updateConditionals() {
  const answers = collectAnswers();
  document.querySelectorAll("[data-conditional]").forEach((element) => {
    const field = form.elements[element.dataset.conditional];
    const visible = field?.type === "checkbox" ? field.checked : Boolean(answers[element.dataset.conditional]);
    element.classList.toggle("is-visible", visible);
  });
}

function syncVisualState(source) {
  const answers = collectAnswers();
  if (liveBrandName) {
    liveBrandName.textContent = answers.businessName || "Tu marca";
  }
  document.querySelectorAll("[name='businessType']").forEach((input) => {
    input.closest("label")?.classList.toggle("is-selected", input.checked);
  });
  document.querySelectorAll("[data-style-choice]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.styleChoice === answers.visualStyle);
  });
  document.querySelectorAll(".wv-feature-flow label").forEach((label) => {
    const input = label.querySelector("input[type='checkbox']");
    if (input) label.classList.toggle("is-selected", input.checked);
  });
  if (source?.closest) pulseSelection(source.closest("label") || source);
  document.documentElement.style.setProperty("--live-primary", answers.primaryColor || "#2f7de1");
  document.documentElement.style.setProperty("--live-accent", answers.accentColor || "#6ac13b");
}

function renderLivePreview() {
  const answers = session.answers || collectAnswers();
  renderPreview(livePreviewMount, answers, selectedFeatureIds, excludedFeatureIds);
}

async function handleLogo(file) {
  if (!file) return;
  const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowed.includes(file.type) || file.size > 2 * 1024 * 1024) {
    window.alert("El logotipo debe ser PNG, JPG, WEBP o SVG y pesar máximo 2 MB.");
    form.elements.logo.value = "";
    trackEvent("logo_upload_rejected", { sessionId: session.id, type: file.type, size: file.size });
    return;
  }
  session.answers.logoDataUrl = await fileToDataUrl(file);
  trackEvent("logo_uploaded", { sessionId: session.id, type: file.type, size: file.size });
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function runGeneration() {
  playCue("generate");
  trackEvent("generation_started", { sessionId: session.id });
  current = SCREENS.indexOf("generating");
  showScreen(current);
  let messageIndex = 0;
  const message = document.querySelector("#generationMessage");
  const messages = [...GENERATION_MESSAGES].sort(() => Math.random() - 0.5);
  if (message) message.textContent = messages[messageIndex++];
  runGenerationVisual();
  const interval = window.setInterval(() => {
    message.textContent = messages[messageIndex % messages.length];
    messageIndex += 1;
  }, 620);

  window.setTimeout(() => {
    window.clearInterval(interval);
    const answers = collectAnswers();
    selectedFeatureIds = inferRequiredFeatures(answers).filter((id) => !excludedFeatureIds.includes(id));
    session.selectedFeatureIds = selectedFeatureIds;
    session.excludedFeatureIds = excludedFeatureIds;
    session.recommendation = buildRecommendation(answers, selectedFeatureIds, excludedFeatureIds);
    persist("recommendation");
    trackEvent("simulation_generated", { sessionId: session.id, basePlanId: session.recommendation.basePlanId });
    playCue("reveal");
    goTo(SCREENS.indexOf("vision"));
  }, 5200);
}

function renderVision() {
  if (!session.recommendation) {
    session.recommendation = buildRecommendation(session.answers, selectedFeatureIds, excludedFeatureIds);
  }
  renderVisionPreview(document.querySelector("#simulationMount"), session.answers, session.recommendation);
  trackEvent("result_viewed", { sessionId: session.id });
}

function renderDiagnosis() {
  playCue("reveal");
  session.recommendation = buildRecommendation(session.answers, selectedFeatureIds, excludedFeatureIds);
  const recommendation = session.recommendation;
  document.querySelector("#solutionName").textContent = recommendation.customName;
  document.querySelector("#solutionSummary").textContent = recommendation.summary;
  animatePriceCounter(document.querySelector("#estimateBadge"), recommendation.pricing.estimated, formatMoney);
  animatePriceCounter(document.querySelector("#estimatedPrice"), recommendation.pricing.estimated, formatMoney);
  animatePriceChange(document.querySelector("#estimatedPrice"));
  document.querySelector("#priceRange").textContent = recommendation.pricing.rangeLabel;
  document.querySelector("#timeEstimate").textContent = recommendation.pricing.timeLabel;
  document.querySelector("#complexityLevel").textContent = recommendation.pricing.complexityLevel;
  document.querySelector("#purchaseSummary").textContent = `${recommendation.customName}. Inversión estimada: ${formatMoney(recommendation.pricing.estimated)}. Anticipo sugerido: ${formatMoney(recommendation.pricing.estimated * 0.5)}.`;
  renderList("#includedList", recommendation.included);
  renderList("#benefitsList", recommendation.benefits);
  renderList("#notNeededList", recommendation.notNeededYet);
  renderList("#reasonsList", recommendation.reasons);
  renderFeatureToggles(recommendation);
  celebrateReveal();
  persist("diagnosis");
}

function renderList(selector, items) {
  document.querySelector(selector).innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderFeatureToggles(recommendation) {
  const ids = Array.from(new Set([...recommendation.includedFeatureIds, ...recommendation.optionalFeatureIds, ...excludedFeatureIds]));
  document.querySelector("#featureToggles").innerHTML = ids.map((id) => {
    const modifier = PRICING_CONFIG.modifiers[id];
    if (!modifier) return "";
    const checked = recommendation.includedFeatureIds.includes(id);
    return `<label class="wv-check"><input type="checkbox" data-feature-id="${id}" ${checked ? "checked" : ""}> ${modifier.label}</label>`;
  }).join("");

  document.querySelectorAll("[data-feature-id]").forEach((input) => {
    input.addEventListener("change", () => {
      const id = input.dataset.featureId;
      const hasFeature = selectedFeatureIds.includes(id);
      const wasExcluded = excludedFeatureIds.includes(id);
      if (input.checked && !hasFeature) {
        selectedFeatureIds.push(id);
        excludedFeatureIds = excludedFeatureIds.filter((item) => item !== id);
        trackEvent("feature_added", { sessionId: session.id, feature: id });
      }
      if (!input.checked) {
        selectedFeatureIds = selectedFeatureIds.filter((item) => item !== id);
        if (!wasExcluded) excludedFeatureIds.push(id);
        trackEvent("feature_removed", { sessionId: session.id, feature: id });
      }
      session.selectedFeatureIds = selectedFeatureIds;
      session.excludedFeatureIds = excludedFeatureIds;
      renderDiagnosis();
    });
  });
}

async function finish(action) {
  collectAnswers();
  if ((action === "purchase" || action === "consultation") && !form.elements.termsAccepted?.checked && action === "purchase") {
    window.alert("Acepta las condiciones para guardar la intención de compra.");
    return;
  }
  const recommendation = buildRecommendation(session.answers, selectedFeatureIds, excludedFeatureIds);
  session.recommendation = recommendation;
  session.actions.push({ action, at: new Date().toISOString() });
  persist(action);
  const eventName = action === "consultation" ? "consultation_requested" : action === "purchase" ? "purchase_intent" : "diagnosis_requested";
  trackEvent(eventName, { sessionId: session.id, estimated: recommendation.pricing.estimated });
  await sendToServer(session, action);
  const finalMessage = document.querySelector("#finalMessage");
  finalMessage.hidden = false;
  finalMessage.textContent = action === "consultation"
    ? "Solicitud guardada. Ixmati podrá dar seguimiento con el resumen de tu Web Vision."
    : action === "purchase"
      ? "Intención de compra guardada. La capa de checkout queda desacoplada para conectarse en la siguiente fase."
      : "Diagnóstico guardado para envío. Si Supabase no está conectado, quedó almacenado localmente en este navegador.";
}

function persist(progress) {
  session.currentScreen = SCREENS[current];
  session.progress = progress;
  session.selectedFeatureIds = selectedFeatureIds;
  session.excludedFeatureIds = excludedFeatureIds;
  saveSession(session);
  captureLead(session, progress);
}
