import { PRICING_CONFIG } from "../config/pricing.js";
import { buildRecommendation } from "./recommendation-engine.js";
import { inferRequiredFeatures, sanitizeText } from "./business-rules.js";
import { formatMoney } from "./pricing-engine.js";
import { renderSimulation } from "./simulation.js";
import { captureLead, loadSession, saveSession, sendToServer } from "./storage.js";
import { trackEvent } from "./analytics.js";

const SCREENS = ["welcome", "business", "branding", "objectives", "features", "generating", "vision", "diagnosis", "conversion"];
const STEP_LABELS = ["Inicio", "Negocio", "Identidad", "Objetivos", "Funciones", "Simulación", "Diagnóstico", "Conversión"];
const OBJECTIVES = [
  ["present", "Presentar mi negocio"],
  ["messages", "Recibir mensajes"],
  ["appointments", "Agendar citas"],
  ["showProducts", "Mostrar productos"],
  ["orders", "Recibir pedidos"],
  ["onlineSales", "Vender en línea"],
  ["payments", "Recibir pagos"],
  ["clients", "Administrar clientes"],
  ["automations", "Automatizar procesos"],
  ["branches", "Mostrar sucursales"],
  ["newClients", "Conseguir clientes"],
  ["community", "Crear comunidad"],
  ["users", "Administrar usuarios"],
  ["other", "Otro"]
];

const FONT_OPTIONS = [
  ["Inter", "Limpia, digital y flexible", "Inter, sans-serif"],
  ["Saira", "Tecnológica y sólida", "Saira, sans-serif"],
  ["Montserrat", "Moderna y comercial", "Montserrat, sans-serif"],
  ["Poppins", "Amigable y premium", "Poppins, sans-serif"],
  ["Space Grotesk", "Startup, tech y editorial", "'Space Grotesk', sans-serif"],
  ["Raleway", "Elegante y ligera", "Raleway, sans-serif"],
  ["Playfair Display", "Editorial y sofisticada", "'Playfair Display', serif"],
  ["DM Serif Display", "Boutique y distintiva", "'DM Serif Display', serif"],
  ["Oswald", "Fuerte y directa", "Oswald, sans-serif"]
];

const generationMessages = [
  "Analizando tu negocio.",
  "Definiendo la estructura.",
  "Interpretando tu identidad.",
  "Construyendo la experiencia.",
  "Preparando tu recomendación.",
  "Calculando la solución ideal."
];

const INTRO_SESSION_KEY = "ixmati_webvision_intro_seen";

let session = loadSession();
let current = Math.max(0, SCREENS.indexOf(session.currentScreen || "welcome"));
let selectedFeatureIds = session.selectedFeatureIds?.length ? session.selectedFeatureIds : [];
let excludedFeatureIds = session.excludedFeatureIds?.length ? session.excludedFeatureIds : [];

const form = document.querySelector("#webvisionForm");
const screens = Array.from(document.querySelectorAll(".wv-screen"));
const nextBtn = document.querySelector("#nextBtn");
const backBtn = document.querySelector("#backBtn");
const progressFill = document.querySelector("#progressFill");
const progressText = document.querySelector("#progressText");
const progressCount = document.querySelector("#progressCount");
const stepList = document.querySelector("#stepList");

init();

function init() {
  renderStepList();
  renderObjectives();
  renderFontSelector();
  hydrateForm();
  bindEvents();
  updateConditionals();
  showScreen(current);
  bootPremiumMotion();
}

function bindEvents() {
  document.querySelector("[data-action='start']").addEventListener("click", () => {
    trackEvent("webvision_started", { sessionId: session.id });
    animateStartTransition();
    current = 1;
    window.setTimeout(() => showScreen(current), window.gsap ? 420 : 0);
  });

  nextBtn.addEventListener("click", next);
  backBtn.addEventListener("click", back);

  form.addEventListener("input", () => {
    collectAnswers();
    updateConditionals();
    persist("input");
  });

  form.addEventListener("change", async (event) => {
    if (event.target.name === "logo") await handleLogo(event.target.files[0]);
    collectAnswers();
    updateConditionals();
    persist("change");
  });

  document.querySelectorAll("[data-device]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-device]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      const mount = document.querySelector("#simulationMount");
      mount.classList.toggle("is-mobile", button.dataset.device === "mobile");
      mount.classList.toggle("is-desktop", button.dataset.device !== "mobile");
    });
  });

  document.querySelector("[data-action='open-preview']").addEventListener("click", () => {
    collectAnswers();
    session.recommendation = buildRecommendation(session.answers, selectedFeatureIds, excludedFeatureIds);
    persist("open_full_preview");
    window.open("./preview.html", "_blank", "noopener,noreferrer");
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

function bootPremiumMotion() {
  rotateHeroTicker();
  const intro = document.querySelector(".wv-intro");
  const introSeen = sessionStorage.getItem(INTRO_SESSION_KEY) === "true";
  if (introSeen && intro) {
    intro.hidden = true;
    intro.style.display = "none";
  }
  if (!window.gsap) return;
  const gsap = window.gsap;
  gsap.set([".wv-hero-copy > *", ".wv-vision-stage"], { opacity: 0, y: 26 });
  const introDuration = introSeen ? 0 : 2.35;
  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => sessionStorage.setItem(INTRO_SESSION_KEY, "true")
  });
  if (!introSeen) {
    timeline
      .fromTo(".wv-intro-line", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.55, ease: "power4.out" })
      .fromTo(".wv-intro-mark", { opacity: 0, rotateY: -38, scale: 0.74 }, { opacity: 1, rotateY: 0, scale: 1, duration: 0.72 }, "-=0.08")
      .fromTo(".wv-intro span", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.58 }, "-=0.28")
      .fromTo(".wv-intro p", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.58 }, "-=0.24")
      .to(".wv-intro", { opacity: 0, scale: 1.04, duration: 0.5, delay: 0.34, pointerEvents: "none" });
  }
  timeline
    .to(".wv-hero-copy > *", { opacity: 1, y: 0, duration: 0.78, stagger: 0.08 }, introSeen ? 0 : `-=${Math.min(0.2, introDuration)}`)
    .to(".wv-vision-stage", { opacity: 1, y: 0, duration: 0.9 }, "-=0.55");
  gsap.to(".wv-device-stack", { y: -14, rotateX: 3, rotateY: -4, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to(".wv-floating-chip", { y: -18, duration: 2.4, stagger: 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to(".wv-holo-ring", { rotate: 360, duration: 22, repeat: -1, ease: "none" });
}

function animateStartTransition() {
  if (!window.gsap) return;
  window.gsap.to(".wv-hero-premium", { opacity: 0, y: -18, scale: 0.98, duration: 0.36, ease: "power2.in" });
}

function rotateHeroTicker() {
  const ticker = document.querySelector("#heroTicker");
  if (!ticker) return;
  const messages = ["Analizando giro", "Diseñando estructura", "Calculando precio", "Generando demo"];
  let index = 0;
  window.setInterval(() => {
    index = (index + 1) % messages.length;
    ticker.textContent = messages[index];
  }, 1300);
}

function next() {
  clearErrors();
  if (!validateCurrent()) return;
  collectAnswers();

  if (SCREENS[current] === "business") trackEvent("business_info_completed", { sessionId: session.id });
  if (SCREENS[current] === "branding") trackEvent("branding_completed", { sessionId: session.id });
  if (SCREENS[current] === "features") {
    trackEvent("requirements_completed", { sessionId: session.id });
    runGeneration();
    return;
  }

  current = Math.min(SCREENS.length - 1, current + 1);
  showScreen(current);
}

function back() {
  current = Math.max(0, current - 1);
  if (SCREENS[current] === "generating") current -= 1;
  showScreen(current);
}

function showScreen(index) {
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
  if (screen === "vision") renderVision();
}

function updateProgress() {
  const visibleIndex = Math.min(current, STEP_LABELS.length - 1);
  const percent = Math.round((visibleIndex / (STEP_LABELS.length - 1)) * 100);
  progressFill.style.width = `${percent}%`;
  progressText.textContent = STEP_LABELS[visibleIndex];
  progressCount.textContent = `${percent}%`;
  Array.from(stepList.children).forEach((item, index) => item.classList.toggle("is-active", index === visibleIndex));
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

function renderFontSelector() {
  const menu = document.querySelector("#fontMenu");
  const trigger = document.querySelector(".wv-font-trigger");
  const hiddenInput = form.elements.typography;
  const preview = document.querySelector("#fontPreviewText");
  const selectedName = document.querySelector("#fontSelectedName");
  const selectedTone = document.querySelector("#fontSelectedTone");

  menu.innerHTML = FONT_OPTIONS.map(([name, tone, family]) => `
    <button type="button" role="option" data-font-name="${name}" data-font-family="${family}" data-font-tone="${tone}" style="font-family:${family}">
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
  const required = Array.from(active.querySelectorAll("[required]"));
  const invalid = required.find((field) => !String(field.value || "").trim());
  if (invalid) {
    invalid.focus();
    showError(invalid.closest("label") || active, "Completa este dato para continuar.");
    return false;
  }
  if (SCREENS[current] === "business") {
    const answers = collectAnswers();
    if (!answers.whatsapp && !answers.email) {
      showError(active.querySelector("[name='whatsapp']").closest("label"), "Agrega WhatsApp o correo para guardar tu diagnóstico.");
      return false;
    }
  }
  return true;
}

function showError(target, message) {
  const error = document.createElement("span");
  error.className = "wv-error";
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
}

function updateConditionals() {
  const answers = collectAnswers();
  document.querySelectorAll("[data-conditional]").forEach((element) => {
    const field = form.elements[element.dataset.conditional];
    const visible = field?.type === "checkbox" ? field.checked : Boolean(answers[element.dataset.conditional]);
    element.classList.toggle("is-visible", visible);
  });
}

async function handleLogo(file) {
  if (!file) return;
  const allowed = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
  if (!allowed.includes(file.type) || file.size > 2 * 1024 * 1024) {
    window.alert("El logotipo debe ser PNG, JPG, WEBP o SVG y pesar máximo 2 MB.");
    form.elements.logo.value = "";
    return;
  }
  session.answers.logoDataUrl = await fileToDataUrl(file);
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function runGeneration() {
  current = SCREENS.indexOf("generating");
  showScreen(current);
  let messageIndex = 0;
  const message = document.querySelector("#generationMessage");
  const interval = window.setInterval(() => {
    message.textContent = generationMessages[messageIndex % generationMessages.length];
    messageIndex += 1;
  }, 420);

  window.setTimeout(() => {
    window.clearInterval(interval);
    const answers = collectAnswers();
    selectedFeatureIds = inferRequiredFeatures(answers).filter((id) => !excludedFeatureIds.includes(id));
    session.selectedFeatureIds = selectedFeatureIds;
    session.excludedFeatureIds = excludedFeatureIds;
    session.recommendation = buildRecommendation(answers, selectedFeatureIds, excludedFeatureIds);
    persist("recommendation");
    trackEvent("simulation_generated", { sessionId: session.id, basePlanId: session.recommendation.basePlanId });
    current = SCREENS.indexOf("vision");
    showScreen(current);
  }, 1600);
}

function renderVision() {
  if (!session.recommendation) {
    session.recommendation = buildRecommendation(session.answers, selectedFeatureIds, excludedFeatureIds);
  }
  renderSimulation(document.querySelector("#simulationMount"), session.answers, session.recommendation);
}

function renderDiagnosis() {
  session.recommendation = buildRecommendation(session.answers, selectedFeatureIds, excludedFeatureIds);
  const recommendation = session.recommendation;
  document.querySelector("#solutionName").textContent = recommendation.customName;
  document.querySelector("#solutionSummary").textContent = recommendation.summary;
  document.querySelector("#estimateBadge").textContent = formatMoney(recommendation.pricing.estimated);
  document.querySelector("#estimatedPrice").textContent = formatMoney(recommendation.pricing.estimated);
  document.querySelector("#priceRange").textContent = recommendation.pricing.rangeLabel;
  document.querySelector("#timeEstimate").textContent = recommendation.pricing.timeLabel;
  document.querySelector("#complexityLevel").textContent = recommendation.pricing.complexityLevel;
  document.querySelector("#purchaseSummary").textContent = `${recommendation.customName}. Inversión estimada: ${formatMoney(recommendation.pricing.estimated)}. Anticipo sugerido: ${formatMoney(recommendation.pricing.estimated * 0.5)}.`;
  renderList("#includedList", recommendation.included);
  renderList("#benefitsList", recommendation.benefits);
  renderList("#notNeededList", recommendation.notNeededYet);
  renderList("#reasonsList", recommendation.reasons);
  renderFeatureToggles(recommendation);
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
