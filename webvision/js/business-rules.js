export const BUSINESS_TYPES = {
  services: ["profesionista", "servicio", "consultorio", "clínica", "clinica", "belleza", "escuela", "organización", "organizacion", "inmobiliaria", "agencia"],
  stores: ["tienda", "productos"],
  restaurants: ["restaurante", "cafetería", "cafeteria", "alimentos"]
};

export const FAMILY_LABELS = {
  services: "servicios",
  stores: "tienda",
  restaurants: "restaurante",
  health: "salud",
  creative: "creativo",
  corporate: "corporativo"
};

export function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function sanitizeText(value, maxLength = 280) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function classifyBusiness(answers) {
  const giro = normalizeText(answers.businessType || answers.industry || "");
  const description = normalizeText(`${answers.description || ""} ${answers.mainProducts || ""}`);
  const text = `${giro} ${description}`;

  if (BUSINESS_TYPES.restaurants.some((item) => text.includes(normalizeText(item)))) return "restaurants";
  if (BUSINESS_TYPES.stores.some((item) => text.includes(normalizeText(item)))) return "stores";
  if (text.includes("clinica") || text.includes("consultorio") || text.includes("salud")) return "health";
  if (text.includes("fotografia") || text.includes("eventos") || text.includes("creativo")) return "creative";
  if (text.includes("corporativo") || text.includes("empresa") || text.includes("organizacion")) return "corporate";
  return "services";
}

export function inferRequiredFeatures(answers) {
  const objectives = answers.objectives || [];
  const features = new Set(["whatsapp"]);
  const productCount = Number(answers.productCount || 0);
  const branches = Number(answers.branches || 1);

  if (objectives.includes("appointments") || answers.needsAppointments) features.add("appointments");
  if (objectives.includes("orders") || answers.needsOrders) features.add("cart");
  if (objectives.includes("onlineSales") || answers.needsEcommerce) features.add("cart");
  if (objectives.includes("payments") || answers.needsPayments) features.add("onlinePayments");
  if (answers.needsAdmin || answers.needsOrders || answers.needsEcommerce || answers.needsUsers) features.add("adminPanel");
  if (answers.needsUsers) features.add("internalUsers");
  if (answers.needsAutomations || answers.needsReminders) features.add("automations");
  if (answers.needsConfirmations || answers.needsReminders || answers.needsEcommerce) features.add("emails");
  if (answers.needsReports) features.add("reports");
  if (answers.needsGoogleAds || objectives.includes("newClients")) features.add("googleAds");
  if (answers.needsMetaAds || objectives.includes("community")) features.add("metaAds");
  if (answers.needsThirdParty) features.add("thirdParty");
  if (answers.specialFeature) features.add("customFeature");
  if (answers.visualStyle && ["premium", "elegante", "creativo", "editorial"].includes(normalizeText(answers.visualStyle))) features.add("visualComplexity");
  if (productCount > 50) features.add("productsExtra");
  if (branches > 1) features.add("branchesExtra");
  if (Number(answers.extraPages || 0) > 0) features.add("extraPage");
  if (answers.priorityDelivery) features.add("priority");
  if (answers.contentVolume === "alto") features.add("contentVolume");

  return Array.from(features);
}

export function chooseBasePlan(family, answers, featureIds) {
  const productCount = Number(answers.productCount || 0);
  const objectives = answers.objectives || [];

  if (family === "restaurants") {
    if (featureIds.includes("reports") || featureIds.includes("metaAds") || featureIds.includes("internalUsers")) return "R3";
    if (featureIds.includes("adminPanel") || featureIds.includes("onlinePayments") || featureIds.includes("cart")) return "R2";
    return "R1";
  }

  if (family === "stores") {
    if (productCount > 300 || featureIds.includes("onlinePayments") || objectives.includes("onlineSales")) return "T3";
    if (productCount > 50 || featureIds.includes("adminPanel") || featureIds.includes("cart")) return "T2";
    return "T1";
  }

  if (featureIds.includes("appointments") && (featureIds.includes("googleAds") || featureIds.includes("metaAds") || objectives.includes("newClients"))) return "S3";
  if (featureIds.includes("appointments")) return "S2";
  return "S1";
}
