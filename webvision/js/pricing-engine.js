import { PRICING_CONFIG } from "../config/pricing.js";

export function formatMoney(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: PRICING_CONFIG.currency,
    maximumFractionDigits: 0
  }).format(Math.round(value));
}

export function calculatePricing({ basePlanId, featureIds = [], excludedFeatureIds = [], answers = {} }) {
  const basePlan = findBasePlan(basePlanId);
  const included = new Set(PRICING_CONFIG.includedByBasePlan[basePlanId] || []);
  const excluded = new Set(excludedFeatureIds);
  let subtotal = basePlan.basePrice;
  let complexity = 1;
  let timeDays = 7;
  const lineItems = [];

  featureIds.forEach((featureId) => {
    if (excluded.has(featureId)) return;
    const modifier = PRICING_CONFIG.modifiers[featureId];
    if (!modifier || included.has(featureId)) return;
    let quantity = 1;
    if (featureId === "extraPage") quantity = Math.max(1, Number(answers.extraPages || 1));
    if (featureId === "branchesExtra") quantity = Math.max(1, Number(answers.branches || 2) - 1);
    if (featureId === "productsExtra") quantity = Math.max(1, Math.ceil(Math.max(0, Number(answers.productCount || 0) - 50) / 150));
    const amount = modifier.price * quantity;
    subtotal += amount;
    complexity += modifier.complexity * quantity;
    timeDays += modifier.timeDays * quantity;
    lineItems.push({ id: featureId, label: modifier.label, quantity, amount });
  });

  excluded.forEach((featureId) => {
    if (!included.has(featureId)) return;
    const credit = PRICING_CONFIG.removalCredits[featureId] || 0;
    if (!credit) return;
    subtotal -= credit;
    lineItems.push({ id: `without-${featureId}`, label: `Sin ${PRICING_CONFIG.modifiers[featureId]?.label || featureId}`, quantity: 1, amount: -credit });
  });

  const visualMultiplier = getVisualMultiplier(answers.visualStyle);
  const urgencyMultiplier = answers.priorityDelivery ? 1.08 : 1;
  const estimated = Math.max(PRICING_CONFIG.minPrice, Math.round((subtotal * visualMultiplier * urgencyMultiplier) / 100) * 100);
  const rangeLow = Math.round((estimated * PRICING_CONFIG.commercialRange.low) / 100) * 100;
  const rangeHigh = Math.round((estimated * PRICING_CONFIG.commercialRange.high) / 100) * 100;

  return {
    basePlanId,
    basePlan,
    subtotal,
    estimated,
    rangeLow,
    rangeHigh,
    rangeLabel: `${formatMoney(rangeLow)} a ${formatMoney(rangeHigh)}`,
    lineItems,
    complexityScore: complexity,
    complexityLevel: complexity < 5 ? "Ligera" : complexity < 10 ? "Media" : "Alta",
    timeDays: Math.max(5, timeDays),
    timeLabel: `${Math.max(5, timeDays)} a ${Math.max(7, timeDays + 5)} días hábiles`
  };
}

export function findBasePlan(planId) {
  for (const group of Object.values(PRICING_CONFIG.basePlans)) {
    if (group[planId]) return group[planId];
  }
  return PRICING_CONFIG.basePlans.services.S1;
}

function getVisualMultiplier(style = "") {
  const normalized = String(style).toLowerCase();
  if (["premium", "editorial", "creativo"].includes(normalized)) return 1.08;
  if (["minimalista", "corporativo"].includes(normalized)) return 1;
  return 1.03;
}
