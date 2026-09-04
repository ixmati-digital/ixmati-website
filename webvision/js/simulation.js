import { sanitizeText } from "./business-rules.js";

const FAMILY_COPY = {
  restaurants: { nav: ["Carta", "Especialidades", "Visítanos"], cta: "Ver la carta", secondary: "Reservar mesa", hero: "Lo bueno empieza cuando eliges bien", system: "Pedidos y reservaciones", eyebrow: "Sabor que se recuerda", section: "Lo que se antoja hoy" },
  stores: { nav: ["Catálogo", "Favoritos", "Visítanos"], cta: "Explorar catálogo", secondary: "Hablar con nosotros", hero: "Encuentra eso que estabas buscando", system: "Catálogo y pedidos", eyebrow: "Una selección hecha para ti", section: "Favoritos de la temporada" },
  health: { nav: ["Servicios", "Especialistas", "Agenda"], cta: "Agendar cita", secondary: "Conocer servicios", hero: "Sentirte bien también puede ser sencillo", system: "Agenda de atención", eyebrow: "Atención que empieza escuchando", section: "Acompañamiento para ti" },
  creative: { nav: ["Proyectos", "Servicios", "Contacto"], cta: "Ver proyectos", secondary: "Hablemos de tu idea", hero: "Ideas con una forma que nadie olvida", system: "Proyectos y solicitudes", eyebrow: "Hecho con intención", section: "Trabajo seleccionado" },
  corporate: { nav: ["Soluciones", "Sectores", "Empresa"], cta: "Solicitar propuesta", secondary: "Conocer capacidades", hero: "La claridad también mueve negocios", system: "Prospectos y propuestas", eyebrow: "Experiencia que da confianza", section: "Lo que podemos resolver" },
  services: { nav: ["Servicios", "Cómo trabajamos", "Contacto"], cta: "Cuéntanos tu proyecto", secondary: "Ver servicios", hero: "Una mejor forma de hacer que suceda", system: "Seguimiento de proyectos", eyebrow: "Soluciones pensadas para avanzar", section: "Cómo podemos ayudarte" }
};

const CARD_DETAILS = [
  ["01", "Descubre", "Una entrada clara para encontrar rápido lo que tu cliente necesita."],
  ["02", "Elige", "Información concreta para comparar, confiar y tomar una decisión."],
  ["03", "Conecta", "Un siguiente paso visible para convertir interés en conversación."],
  ["04", "Avanza", "Una base digital preparada para crecer junto con el negocio."]
];

const IMAGE_LIBRARY = {
  restaurants: ["photo-1515003197210-e0cd71810b5f", "photo-1504674900247-0877df9cc836", "photo-1559339352-11d035aa65de"],
  stores: ["photo-1441986300917-64674bd600d8", "photo-1523779917675-b6ed3a42a561", "photo-1523381210434-271e8be1f52b"],
  health: ["photo-1576091160399-112ba8d25d1d", "photo-1559757175-0eb30cd8c063", "photo-1584515933487-779824d29309"],
  creative: ["photo-1497366754035-f200968a6e72", "photo-1516321318423-f06f85e504b3", "photo-1497215728101-856f4ea42174"],
  corporate: ["photo-1497366811353-6870744d04b2", "photo-1556761175-b413da4baf72", "photo-1551836022-d5d88e9218df"],
  services: ["photo-1556761175-5973dc0f32e7", "photo-1521737711867-e3b97375f902", "photo-1552664730-d307ca884978"]
};

export function renderSimulation(mount, answers, recommendation, options = {}) {
  const profile = buildProfile(answers, recommendation);
  const modeClass = options.fullPage ? "is-full-preview" : "";
  mount.innerHTML = `
    <div class="wv-preview ${modeClass} preview-layout-${profile.layout}" style="--preview-primary:${profile.primary};--preview-accent:${profile.accent};--preview-ink:#102033;--preview-bg:#ffffff;--preview-font:${profile.fontFamily};">
      <div class="preview-watermark">Creado con Ixmati Web Vision</div>
      <header class="preview-nav">
        <a class="preview-logo" href="#preview-home" data-preview-view="preview-home" aria-label="Ir al inicio">
          ${profile.logo ? `<img src="${escapeAttr(profile.logo)}" alt="Logo de ${escapeAttr(profile.business)}">` : `<span class="preview-temp-logo">${escapeHtml(profile.business.slice(0, 1).toUpperCase())}</span>`}
          <span>${escapeHtml(profile.business)}</span>
        </a>
        <nav class="preview-links" aria-label="Navegación principal">${profile.nav.map((item, index) => `<a class="${index === 0 ? "is-active" : ""}" href="#${profile.navTargets[index]}" data-preview-view="${profile.navTargets[index]}">${escapeHtml(item)}</a>`).join("")}</nav>
        <button class="preview-cta preview-cta-small" type="button" data-preview-action="open-contact">${escapeHtml(profile.cta)}</button>
      </header>
      <div class="preview-topline"><span><i></i> ${escapeHtml(profile.city)} · ${escapeHtml(profile.audience)}</span><span>${escapeHtml(profile.included.slice(0, 3).join(" · "))}</span></div>

      <main>
        <section class="preview-hero" id="preview-home" data-preview-section>
          <div class="preview-hero-copy"><p class="wv-kicker">${escapeHtml(profile.eyebrow)}</p><h3>${escapeHtml(profile.hero)}</h3><p>${escapeHtml(profile.description)}</p><div class="preview-hero-actions"><button class="preview-cta" type="button" data-preview-action="open-catalog">${escapeHtml(profile.cta)}</button><button class="preview-secondary" type="button" data-preview-action="open-contact">${escapeHtml(profile.secondary)}</button></div><div class="preview-proof"><span>✦</span> ${escapeHtml(profile.proof)}</div></div>
          <div class="preview-visual preview-hero-media"><img src="${imageUrl(profile.images[0])}" alt="${escapeAttr(profile.imageAlt)}" loading="eager" onerror="this.hidden=true"><div class="preview-media-caption"><span>${escapeHtml(profile.imageLabel)}</span><b>${escapeHtml(profile.city)}</b></div></div>
        </section>

        <section class="preview-trust"><span>Una experiencia para</span><b>conocer</b><span>elegir</span><b>y volver.</b></section>

        <section class="preview-section preview-catalog" id="preview-catalog" data-preview-section><div class="preview-section-heading"><div><p class="preview-eyebrow">${escapeHtml(profile.sectionEyebrow)}</p><h4>${escapeHtml(profile.sectionTitle)}</h4></div><button class="preview-text-button" type="button" data-preview-action="open-catalog">Ver todo <b>→</b></button></div><div class="preview-product-grid">${profile.items.map((item, index) => renderItem(item, index, profile)).join("")}</div></section>

        <section class="preview-story" id="preview-story" data-preview-section><div class="preview-story-image"><img src="${imageUrl(profile.images[1])}" alt="${escapeAttr(profile.imageAlt)}" loading="lazy" onerror="this.hidden=true"></div><div class="preview-story-copy"><p class="preview-eyebrow">${escapeHtml(profile.storyEyebrow)}</p><h4>${escapeHtml(profile.storyTitle)}</h4><p>${escapeHtml(profile.storyText)}</p><button class="preview-secondary" type="button" data-preview-action="open-contact">${escapeHtml(profile.secondary)} <b>→</b></button></div></section>

        <section class="preview-section preview-experience" id="preview-experience" data-preview-section><div class="preview-section-heading"><div><p class="preview-eyebrow">La diferencia está en los detalles</p><h4>${escapeHtml(profile.experienceTitle)}</h4></div><span class="preview-section-note">${escapeHtml(profile.included[0] || "Atención cercana")}</span></div><div class="preview-feature-grid">${profile.features.map((item, index) => `<article class="preview-feature"><span class="preview-feature-number">0${index + 1}</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.text)}</p></article>`).join("")}</div></section>

        <section class="preview-gallery" id="preview-gallery" data-preview-section><div class="preview-section-heading"><div><p class="preview-eyebrow">Un vistazo más de cerca</p><h4>${escapeHtml(profile.galleryTitle)}</h4></div><button class="preview-text-button" type="button" data-preview-action="open-gallery">Abrir galería <b>→</b></button></div><div class="preview-gallery-grid">${profile.images.map((image, index) => `<button type="button" class="preview-gallery-item preview-gallery-item-${index + 1}" data-preview-action="open-gallery"><img src="${imageUrl(image)}" alt="${escapeAttr(profile.imageAlt)}" loading="lazy" onerror="this.hidden=true"><span>${escapeHtml(index === 0 ? profile.imageLabel : profile.galleryLabels[index - 1])}</span></button>`).join("")}</div></section>

        <section class="preview-steps" id="preview-steps" data-preview-section><div><p class="preview-eyebrow">Así de fácil</p><h4>${escapeHtml(profile.stepsTitle)}</h4></div><div class="preview-step-list">${profile.steps.map((step, index) => `<div class="preview-step"><span>0${index + 1}</span><strong>${escapeHtml(step)}</strong></div>`).join("")}</div></section>
        <section class="preview-testimonial"><div class="preview-quote-mark">“</div><blockquote>${escapeHtml(profile.testimonial)}</blockquote><span>${escapeHtml(profile.testimonialRole)}</span></section>
        <section class="preview-faq" id="preview-faq" data-preview-section><div><p class="preview-eyebrow">Preguntas frecuentes</p><h4>${escapeHtml(profile.faqTitle)}</h4></div><div class="preview-faq-list">${profile.faqs.map((faq, index) => `<div class="preview-faq-item ${index === 0 ? "is-open" : ""}"><button type="button" data-preview-action="toggle-faq" aria-expanded="${index === 0}">${escapeHtml(faq.question)} <b>+</b></button><p>${escapeHtml(faq.answer)}</p></div>`).join("")}</div></section>
      </main>
      <footer class="preview-footer" id="preview-contact" data-preview-section><div><p class="preview-eyebrow">${escapeHtml(profile.footerEyebrow)}</p><strong>${escapeHtml(profile.business)}</strong><span>${escapeHtml(profile.footerText)}</span></div><button class="preview-cta" type="button" data-preview-action="open-contact">${escapeHtml(profile.cta)} <b>→</b></button></footer>
      <div class="preview-modal" data-preview-modal aria-hidden="true"><div class="preview-modal-backdrop" data-preview-action="close-modal"></div><div class="preview-modal-card" role="dialog" aria-modal="true" aria-labelledby="previewModalTitle"><button class="preview-modal-close" type="button" data-preview-action="close-modal" aria-label="Cerrar">×</button><div data-preview-modal-content></div></div></div><div class="preview-toast" data-preview-toast role="status"></div>
    </div>`;
  bindInteractions(mount.querySelector(".wv-preview"), profile);
}

function buildProfile(answers, recommendation) {
  const family = recommendation.family || "services";
  const copy = FAMILY_COPY[family] || FAMILY_COPY.services;
  const business = sanitizeText(answers.businessName, 80) || "Tu negocio";
  const city = sanitizeText(answers.city, 80) || "Tu ciudad";
  const products = splitList(answers.mainProducts || answers.description || "");
  const included = recommendation.included || [];
  const primary = answers.primaryColor || "#2f7de1";
  const accent = answers.accentColor || "#6ac13b";
  const style = sanitizeText(answers.visualStyle, 40) || "Moderno";
  const font = sanitizeText(answers.typography, 80) || "Inter";
  const layout = normalize(style).includes("editorial") || family === "creative" ? "editorial" : family === "corporate" ? "structured" : family === "restaurants" ? "immersive" : "commerce";
  const items = (products.length ? products : ["Lo que hacemos mejor", "Lo que tus clientes buscan", "Una atención memorable", "El siguiente paso"]).slice(0, 4).map((name, index) => ({ name, label: CARD_DETAILS[index % CARD_DETAILS.length][1], price: index % 2 ? "A tu medida" : "Disponible hoy" }));
  return { family, business, city, audience: sanitizeText(answers.audience || answers.clientType || "personas que buscan una mejor opción", 80), primary, accent, layout, fontFamily: fontFamilyFor(font), logo: answers.logoDataUrl, included, nav: copy.nav, navTargets: ["preview-catalog", "preview-experience", "preview-contact"], cta: copy.cta, secondary: copy.secondary, eyebrow: copy.eyebrow, hero: customHero(answers, copy.hero), description: businessDescription(answers, copy, family), proof: family === "corporate" ? "Información clara para tomar mejores decisiones." : "Todo lo que necesitas, en un solo lugar.", sectionEyebrow: family === "stores" || family === "restaurants" ? "Para elegir sin complicaciones" : "Una propuesta pensada para ti", sectionTitle: copy.section, items, images: IMAGE_LIBRARY[family] || IMAGE_LIBRARY.services, imageAlt: `${business}: ${sanitizeText(answers.mainProducts || answers.businessType || "experiencia", 80)}`, imageLabel: products[0] || "Lo que hacemos", galleryLabels: ["La experiencia", "Cada detalle"], storyEyebrow: "Más que una página", storyTitle: family === "corporate" ? "Una presencia que abre conversaciones." : "Que la gente entienda por qué elegirte.", storyText: `En ${business}, cada detalle cuenta. Presenta lo que haces con claridad, muestra tu valor y facilita que la persona correcta dé el siguiente paso.`, experienceTitle: family === "stores" || family === "restaurants" ? "Todo listo para disfrutar" : "Una experiencia que trabaja contigo", features: buildFeatures(copy, recommendation, family), galleryTitle: family === "restaurants" ? "Que se antoje antes de llegar" : "Lo que quieres que recuerden", stepsTitle: family === "corporate" ? "De la conversación a la propuesta" : "Empieza cuando quieras", steps: buildSteps(recommendation, family), testimonial: testimonialFor(family), testimonialRole: family === "corporate" ? "Una relación que empieza con claridad" : "Una experiencia pensada para volver", faqTitle: "Lo que necesitas saber", faqs: buildFaqs(recommendation, family), footerEyebrow: "Hablemos de lo que sigue", footerText: `Estamos en ${city}. Será un gusto atenderte.` };
}

function renderItem(item, index, profile) { const detail = CARD_DETAILS[index % CARD_DETAILS.length]; return `<article class="preview-product-card"><div class="preview-product-image"><img src="${imageUrl(profile.images[index % profile.images.length])}" alt="${escapeAttr(item.name)}" loading="lazy" onerror="this.hidden=true"><span>${escapeHtml(detail[0])}</span></div><div class="preview-product-body"><small>${escapeHtml(item.label)}</small><strong>${escapeHtml(titleCase(item.name))}</strong><p>${escapeHtml(item.price)}</p><button type="button" data-preview-action="open-detail" data-preview-name="${escapeAttr(item.name)}">Ver detalle <b>↗</b></button></div></article>`; }

function bindInteractions(root, profile) {
  if (!root) return;
  root.addEventListener("click", (event) => {
    const target = event.target.closest("[data-preview-action], [data-preview-view]");
    if (!target || !root.contains(target)) return;
    const action = target.dataset.previewAction;
    const view = target.dataset.previewView;
    if (view) { event.preventDefault(); root.querySelectorAll(".preview-links a").forEach((link) => link.classList.toggle("is-active", link === target)); scrollToPreview(root, view); return; }
    if (action === "open-contact") openModal(root, profile, "contact");
    if (action === "open-catalog") scrollToPreview(root, "preview-catalog");
    if (action === "open-detail") openModal(root, profile, "detail", target.dataset.previewName);
    if (action === "open-gallery") openModal(root, profile, "gallery");
    if (action === "toggle-faq") { const item = target.closest(".preview-faq-item"); const open = item.classList.toggle("is-open"); target.setAttribute("aria-expanded", String(open)); }
    if (action === "close-modal") closeModal(root);
  });
  root.addEventListener("submit", (event) => { if (!event.target.matches("[data-preview-form]")) return; event.preventDefault(); const button = event.target.querySelector("button[type=submit]"); if (button) button.textContent = "Solicitud recibida ✓"; showToast(root, "Gracias. En una demo real, aquí continuaríamos la conversación."); });
}

function openModal(root, profile, type, itemName = "") { const modal = root.querySelector("[data-preview-modal]"); const content = root.querySelector("[data-preview-modal-content]"); if (!modal || !content) return; const title = type === "contact" ? "Hagamos que suceda" : type === "gallery" ? "Un vistazo más de cerca" : titleCase(itemName || profile.sectionTitle); const body = type === "contact" ? `<p>Cuéntanos qué estás buscando y demos el siguiente paso.</p><form data-preview-form><label>Tu nombre<input required name="name" placeholder="Nombre"></label><label>Tu mensaje<textarea required name="message" placeholder="¿Cómo podemos ayudarte?"></textarea></label><button class="preview-cta" type="submit">Enviar solicitud</button></form>` : type === "gallery" ? `<p>Una muestra visual de cómo podría sentirse tu presencia digital.</p><div class="preview-modal-gallery">${profile.images.map((image, index) => `<img src="${imageUrl(image)}" alt="${escapeAttr(profile.imageAlt)} ${index + 1}" loading="lazy" onerror="this.hidden=true">`).join("")}</div>` : `<p>${escapeHtml(profile.description)}</p><div class="preview-modal-detail"><span>Disponible para explorar</span><strong>${escapeHtml(itemName || profile.business)}</strong><button class="preview-cta" type="button" data-preview-action="open-contact">Me interesa <b>→</b></button></div>`; content.innerHTML = `<p class="preview-eyebrow">${escapeHtml(profile.business)}</p><h4 id="previewModalTitle">${escapeHtml(title)}</h4>${body}`; modal.setAttribute("aria-hidden", "false"); modal.classList.add("is-open"); }
function closeModal(root) { const modal = root.querySelector("[data-preview-modal]"); if (modal) { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); } }
function scrollToPreview(root, id) { const target = root.querySelector(`#${id}`); if (target) target.scrollIntoView({ behavior: "smooth", block: "start" }); }
function showToast(root, message) { const toast = root.querySelector("[data-preview-toast]"); if (!toast) return; toast.textContent = message; toast.classList.add("is-visible"); window.setTimeout(() => toast.classList.remove("is-visible"), 4200); }
function buildFeatures(copy, recommendation, family) { const included = recommendation.included || []; return copy.nav.slice(0, 3).map((title, index) => ({ title, text: included[index] || CARD_DETAILS[index][2] })).concat(family === "corporate" ? [{ title: "Cotización", text: "Un camino claro para iniciar una conversación comercial." }] : []).slice(0, 4); }
function buildSteps(recommendation, family) { if (recommendation.included?.includes("Agenda")) return ["Elige lo que necesitas", "Selecciona el momento ideal", "Recibe confirmación"]; if (family === "stores" || family === "restaurants") return ["Explora la selección", "Elige tus favoritos", "Haz tu pedido"]; return ["Cuéntanos tu objetivo", "Construimos la mejor ruta", "Empieza a avanzar"]; }
function buildFaqs(recommendation, family) { const faq = [{ question: "¿Cómo puedo comenzar?", answer: "Elige la opción que mejor se ajuste a lo que necesitas y te acompañamos en el siguiente paso." }, { question: "¿Puedo pedir información personalizada?", answer: "Claro. Cada proyecto se adapta a tu negocio, tus clientes y la forma en que quieres trabajar." }]; if (recommendation.included?.includes("Pagos en línea") || family === "stores") faq.push({ question: "¿Puedo comprar o solicitar una cotización?", answer: "Sí. Esta experiencia puede conectar la consulta, el pedido o la cotización en un flujo sencillo." }); return faq; }
function testimonialFor(family) { return family === "restaurants" ? "Se siente como llegar a un lugar que ya conoces, aunque sea la primera vez." : family === "corporate" ? "La información está donde debe estar y la conversación empieza mucho mejor." : "Por fin una forma clara de mostrar todo lo que hacemos."; }
function businessDescription(answers, copy, family) { const text = sanitizeText(answers.description || answers.mainProducts, 180); if (text) return `${text}. Una experiencia pensada para que tus clientes encuentren, entiendan y actúen.`; return `${copy.hero}. ${family === "stores" ? "Elige con calma y recibe atención cercana." : "Conoce nuestra propuesta y encuentra el siguiente paso."}`; }
function customHero(answers, fallback) { const business = sanitizeText(answers.businessName, 80); if (!business) return fallback; if (answers.needsPayments) return `${business}: listo para vender de verdad`; if (answers.needsAppointments) return `${business}, atención cuando la necesitas`; if (answers.needsOrders) return `${business}: pedir es más fácil`; return `${business}, hecho para dejar huella`; }
function splitList(value) { return sanitizeText(value, 240).split(/[,;|\n]+/).map((item) => item.trim()).filter((item) => item.length > 2).slice(0, 4); }
function imageUrl(id) { return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82&ixlib=rb-4.1.0`; }
function fontFamilyFor(name) { const fonts = { Inter: "Inter, sans-serif", Saira: "Saira, sans-serif", Montserrat: "Montserrat, sans-serif", Poppins: "Poppins, sans-serif", "Space Grotesk": "'Space Grotesk', sans-serif", Raleway: "Raleway, sans-serif", "Playfair Display": "'Playfair Display', serif", "DM Serif Display": "'DM Serif Display', serif", Oswald: "Oswald, sans-serif" }; return fonts[name] || "Inter, sans-serif"; }
function normalize(value) { return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function titleCase(value) { return String(value || "").toLocaleLowerCase("es-MX").replace(/(^|[\s-])([a-záéíóúñ])/g, (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("es-MX")}`); }
function escapeHtml(value) { return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
function escapeAttr(value) { return escapeHtml(value).replace(/`/g, "&#096;"); }
