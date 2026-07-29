import { classifyBusiness, chooseBasePlan, inferRequiredFeatures, sanitizeText } from "./business-rules.js";
import { calculatePricing } from "./pricing-engine.js";
import { PRICING_CONFIG } from "../config/pricing.js";

const SOLUTION_NAMES = {
  S1: "Sitio web de presencia profesional",
  S2: "Sitio web con agenda inteligente",
  S3: "Sistema web para captación de clientes",
  T1: "Catálogo digital con pedidos por WhatsApp",
  T2: "Catálogo digital con pedidos y panel administrativo",
  T3: "Ecommerce con operación de pedidos y pagos en línea",
  R1: "Menú digital con pedidos preparados para WhatsApp",
  R2: "Aplicación web para pedidos asistidos",
  R3: "Plataforma web para operación y crecimiento"
};

const BENEFIT_MAP = {
  whatsapp: "Contacto inmediato con clientes interesados",
  appointments: "Menos fricción para reservar horarios",
  cart: "Pedidos más ordenados antes de llegar a WhatsApp",
  onlinePayments: "Cobros dentro de la experiencia digital",
  adminPanel: "Control interno de pedidos, productos o solicitudes",
  internalUsers: "Trabajo coordinado entre varias personas",
  automations: "Seguimiento sin depender de procesos manuales",
  emails: "Confirmaciones claras para el cliente",
  reports: "Datos para decidir qué vender, impulsar o mejorar",
  googleAds: "Demanda desde personas que ya están buscando",
  metaAds: "Alcance en Facebook e Instagram para generar intención",
  branchesExtra: "Información clara por sucursal",
  visualComplexity: "Una primera impresión más alineada con la marca"
};

export function buildRecommendation(answers, selectedFeatureIds, excludedFeatureIds = []) {
  const family = classifyBusiness(answers);
  const excluded = new Set(excludedFeatureIds || []);
  const detectedFeatures = (selectedFeatureIds || inferRequiredFeatures(answers)).filter((id) => !excluded.has(id));
  const basePlanId = chooseBasePlan(family === "health" || family === "creative" || family === "corporate" ? "services" : family, answers, detectedFeatures);
  const pricing = calculatePricing({ basePlanId, featureIds: detectedFeatures, excludedFeatureIds, answers });
  const includedBase = PRICING_CONFIG.includedByBasePlan[basePlanId] || [];
  const allFeatures = Array.from(new Set([...includedBase, ...detectedFeatures])).filter((id) => !excluded.has(id));
  const included = allFeatures.map((id) => PRICING_CONFIG.modifiers[id]?.label).filter(Boolean);
  const optional = buildOptionalFeatures(allFeatures, family);

  return {
    family,
    basePlanId,
    solutionType: SOLUTION_NAMES[basePlanId],
    customName: customizeName(basePlanId, answers, allFeatures),
    pricing,
    includedFeatureIds: allFeatures,
    optionalFeatureIds: optional,
    included,
    optional: optional.map((id) => PRICING_CONFIG.modifiers[id]?.label).filter(Boolean),
    benefits: allFeatures.map((id) => BENEFIT_MAP[id]).filter(Boolean).slice(0, 6),
    reasons: buildReasons(basePlanId, answers, allFeatures),
    notNeededYet: buildNotNeededYet(allFeatures),
    summary: buildSummary(answers, basePlanId, allFeatures, pricing)
  };
}

function customizeName(basePlanId, answers, features) {
  const name = sanitizeText(answers.businessName, 80) || "tu negocio";
  if (features.includes("onlinePayments")) return `Sistema web para ${name} con pagos en línea`;
  if (features.includes("appointments")) return `Agenda digital para ${name}`;
  if (features.includes("adminPanel")) return `Plataforma operativa para ${name}`;
  return `${SOLUTION_NAMES[basePlanId]} para ${name}`;
}

function buildReasons(basePlanId, answers, features) {
  const productCount = Number(answers.productCount || 0);
  const reasons = [];
  if (productCount > 0) reasons.push(`Manejas ${productCount} productos, por eso conviene estructurar catálogo y pedidos.`);
  if (features.includes("appointments")) reasons.push("Tus clientes necesitan elegir horarios sin esperar una respuesta manual.");
  if (features.includes("onlinePayments")) reasons.push("Quieres cobrar desde la página, así que la solución requiere una capa de pagos.");
  if (features.includes("adminPanel")) reasons.push("Necesitas controlar solicitudes desde un panel en lugar de depender solo de mensajes.");
  if (features.includes("googleAds") || features.includes("metaAds")) reasons.push("Tu objetivo incluye conseguir clientes, por eso se considera una base de publicidad inicial.");
  if (!reasons.length) reasons.push("Buscas presentar tu negocio con claridad y convertir visitas en conversaciones por WhatsApp.");
  reasons.push(`La base de cálculo usada fue ${basePlanId}, ajustada por funciones y complejidad real.`);
  return reasons;
}

function buildOptionalFeatures(features, family) {
  const candidates = family === "restaurants"
    ? ["onlinePayments", "reports", "metaAds", "internalUsers"]
    : family === "stores"
      ? ["onlinePayments", "reports", "metaAds", "thirdParty"]
      : ["appointments", "googleAds", "metaAds", "automations"];
  return candidates.filter((id) => !features.includes(id));
}

function buildNotNeededYet(features) {
  const response = [];
  if (!features.includes("onlinePayments")) response.push("Pagos en línea");
  if (!features.includes("reports")) response.push("Reportes avanzados");
  if (!features.includes("internalUsers")) response.push("Roles complejos de usuario");
  return response.slice(0, 3);
}

function buildSummary(answers, basePlanId, features, pricing) {
  const business = sanitizeText(answers.businessName, 80) || "tu negocio";
  const action = features.includes("onlinePayments")
    ? "vender y cobrar desde la página"
    : features.includes("appointments")
      ? "recibir citas organizadas"
      : features.includes("cart")
        ? "recibir pedidos con más orden"
        : "presentarse y captar prospectos";
  return `Por lo que nos contaste, ${business} necesita una solución para ${action}. La inversión estimada es ${pricing.rangeLabel}, con complejidad ${pricing.complexityLevel.toLowerCase()}.`;
}
