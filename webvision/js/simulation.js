import { sanitizeText } from "./business-rules.js";

const FAMILY_COPY = {
  restaurants: {
    nav: ["Menú", "Pedidos", "Ubicación"],
    cta: "Hacer pedido",
    secondary: "Ver menú",
    hero: "Ordena fácil, rápido y con sabor local",
    cards: ["Menú con fotos", "Pedido por WhatsApp", "Horarios y ubicación"],
    system: "Panel de órdenes"
  },
  stores: {
    nav: ["Catálogo", "Destacados", "Pedidos"],
    cta: "Ver productos",
    secondary: "Pedir por WhatsApp",
    hero: "Compra tus productos favoritos en minutos",
    cards: ["Catálogo organizado", "Productos destacados", "Pedidos claros"],
    system: "Control de pedidos"
  },
  health: {
    nav: ["Servicios", "Agenda", "Contacto"],
    cta: "Agendar cita",
    secondary: "Conocer servicios",
    hero: "Atención profesional con agenda simple",
    cards: ["Servicios claros", "Horarios disponibles", "Confirmaciones"],
    system: "Calendario de citas"
  },
  creative: {
    nav: ["Portafolio", "Servicios", "Contacto"],
    cta: "Cotizar proyecto",
    secondary: "Ver portafolio",
    hero: "Una experiencia visual para mostrar tu trabajo",
    cards: ["Portafolio", "Paquetes", "Formulario de proyecto"],
    system: "Brief de clientes"
  },
  corporate: {
    nav: ["Soluciones", "Proceso", "Contacto"],
    cta: "Solicitar propuesta",
    secondary: "Ver soluciones",
    hero: "Presencia digital clara para decisiones comerciales",
    cards: ["Soluciones", "Casos", "Contacto calificado"],
    system: "Panel de prospectos"
  },
  services: {
    nav: ["Servicios", "Agenda", "Contacto"],
    cta: "Hablar por WhatsApp",
    secondary: "Ver servicios",
    hero: "Convierte visitas en clientes interesados",
    cards: ["Servicios", "Beneficios", "Contacto directo"],
    system: "Seguimiento de prospectos"
  }
};

export function renderSimulation(mount, answers, recommendation, options = {}) {
  const family = FAMILY_COPY[recommendation.family] || FAMILY_COPY.services;
  const businessName = sanitizeText(answers.businessName, 80) || "Tu negocio";
  const city = sanitizeText(answers.city, 80) || "tu ciudad";
  const products = sanitizeText(answers.mainProducts, 140) || family.cards.join(", ");
  const primary = answers.primaryColor || "#2f7de1";
  const accent = answers.accentColor || "#6ac13b";
  const logo = answers.logoDataUrl;
  const style = sanitizeText(answers.visualStyle, 40) || "Moderno";
  const typography = sanitizeText(answers.typography, 80) || "Inter";
  const fontFamily = fontFamilyFor(typography);
  const modeClass = options.fullPage ? "is-full-preview" : "";

  mount.innerHTML = `
    <div class="wv-preview ${modeClass}" style="--preview-primary:${primary};--preview-accent:${accent};--preview-ink:#102033;--preview-bg:#ffffff;--preview-font:${fontFamily};">
      <div class="preview-watermark">Vista previa protegida · Ixmati Web Vision</div>
      <header class="preview-nav">
        <div class="preview-logo">
          ${logo ? `<img src="${logo}" alt="Logo de ${escapeHtml(businessName)}">` : `<span class="preview-temp-logo">${escapeHtml(businessName.slice(0, 1).toUpperCase())}</span>`}
          <span>${escapeHtml(businessName)}</span>
        </div>
        <nav class="preview-links">${family.nav.map((item) => `<a>${escapeHtml(item)}</a>`).join("")}</nav>
        <a class="preview-cta" href="#preview-contact">${escapeHtml(family.cta)}</a>
      </header>
      <section class="preview-hero">
        <div>
          <p class="wv-kicker">${escapeHtml(style)} · ${escapeHtml(city)} · ${escapeHtml(typography)}</p>
          <h3>${escapeHtml(customHero(answers, family.hero))}</h3>
          <p>${escapeHtml(products)} presentado con una experiencia lista para convertir visitas en acciones reales.</p>
          <a class="preview-cta" href="#preview-system">${escapeHtml(family.cta)}</a>
          <a class="preview-secondary" href="#preview-contact">${escapeHtml(family.secondary)}</a>
        </div>
        <div class="preview-visual" aria-label="Vista aproximada del sistema recomendado">
          <div class="preview-widget">
            <strong>${escapeHtml(family.system)}</strong>
            ${recommendation.included.slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
          </div>
        </div>
      </section>
      <section class="preview-section" id="preview-system">
        <h4>${escapeHtml(recommendation.solutionType)}</h4>
        <div class="preview-grid">
          ${family.cards.map((item, index) => `
            <article class="preview-card">
              <strong>${escapeHtml(item)}</strong>
              <p>${escapeHtml(previewText(index, recommendation))}</p>
            </article>
          `).join("")}
        </div>
      </section>
      <footer class="preview-footer" id="preview-contact">
        <strong>${escapeHtml(businessName)}</strong>
        <span>WhatsApp · Contacto · ${escapeHtml(city)}</span>
      </footer>
    </div>
  `;
}

function fontFamilyFor(name) {
  const fonts = {
    Inter: "Inter, sans-serif",
    Saira: "Saira, sans-serif",
    Montserrat: "Montserrat, sans-serif",
    Poppins: "Poppins, sans-serif",
    "Space Grotesk": "'Space Grotesk', sans-serif",
    Raleway: "Raleway, sans-serif",
    "Playfair Display": "'Playfair Display', serif",
    "DM Serif Display": "'DM Serif Display', serif",
    Oswald: "Oswald, sans-serif"
  };
  return fonts[name] || "Inter, sans-serif";
}

function customHero(answers, fallback) {
  const businessName = sanitizeText(answers.businessName, 80);
  if (!businessName) return fallback;
  if (answers.needsPayments) return `${businessName} listo para vender y cobrar en línea`;
  if (answers.needsAppointments) return `${businessName} con agenda disponible desde internet`;
  if (answers.needsOrders) return `${businessName} con pedidos más fáciles de organizar`;
  return `${businessName} con presencia digital profesional`;
}

function previewText(index, recommendation) {
  const items = recommendation.benefits;
  return items[index] || "Sección diseñada para guiar al visitante hacia la acción correcta.";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
