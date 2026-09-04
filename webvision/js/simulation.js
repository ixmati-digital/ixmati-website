import { sanitizeText } from "./business-rules.js";

const FAMILY = {
  restaurants: { offer: "Carta", offerPlural: "Especialidades", cta: "Ver la carta", hero: "Lo bueno empieza cuando eliges bien", tone: "Sabor que se recuerda" },
  stores: { offer: "Catálogo", offerPlural: "Favoritos", cta: "Explorar catálogo", hero: "Encuentra eso que estabas buscando", tone: "Una selección hecha para ti" },
  health: { offer: "Servicios", offerPlural: "Especialistas", cta: "Agendar cita", hero: "Sentirte bien también puede ser sencillo", tone: "Atención que empieza escuchando" },
  creative: { offer: "Proyectos", offerPlural: "Servicios", cta: "Ver proyectos", hero: "Ideas con una forma que nadie olvida", tone: "Hecho con intención" },
  corporate: { offer: "Soluciones", offerPlural: "Sectores", cta: "Solicitar propuesta", hero: "La claridad también mueve negocios", tone: "Experiencia que da confianza" },
  services: { offer: "Servicios", offerPlural: "Cómo trabajamos", cta: "Cuéntanos tu proyecto", hero: "Una mejor forma de hacer que suceda", tone: "Soluciones pensadas para avanzar" }
};

const IMAGE_LIBRARY = {
  restaurants: ["photo-1515003197210-e0cd71810b5f", "photo-1504674900247-0877df9cc836", "photo-1559339352-11d035aa65de"],
  stores: ["photo-1441986300917-64674bd600d8", "photo-1523779917675-b6ed3a42a561", "photo-1523381210434-271e8be1f52b"],
  health: ["photo-1576091160399-112ba8d25d1d", "photo-1559757175-0eb30cd8c063", "photo-1584515933487-779824d29309"],
  creative: ["photo-1497366754035-f200968a6e72", "photo-1516321318423-f06f85e504b3", "photo-1497215728101-856f4ea42174"],
  corporate: ["photo-1497366811353-6870744d04b2", "photo-1556761175-b413da4baf72", "photo-1551836022-d5d88e9218df"],
  services: ["photo-1556761175-5973dc0f32e7", "photo-1521737711867-e3b97375f902", "photo-1552664730-d307ca884978"]
};

export function renderSimulation(mount, answers, recommendation, options = {}) {
  const site = buildSite(answers, recommendation);
  const mode = options.fullPage ? "is-full-preview" : "";
  mount.innerHTML = `<div class="wv-preview ${mode} preview-site preview-layout-${site.layout}" style="--preview-primary:${site.primary};--preview-accent:${site.accent};--preview-ink:#102033;--preview-bg:#fff;--preview-font:${site.fontFamily};">
    <div class="preview-watermark">Creado con Ixmati Web Vision</div>
    <header class="preview-nav"><a class="preview-logo" href="#home" data-site-route="home" aria-label="Ir al inicio">${site.logo ? `<img src="${escapeAttr(site.logo)}" alt="Logo de ${escapeAttr(site.business)}">` : `<span class="preview-temp-logo">${escapeHtml(site.business.slice(0, 1).toUpperCase())}</span>`}<span>${escapeHtml(site.business)}</span></a><nav class="preview-links" aria-label="Navegación principal">${site.pages.map((page) => `<a href="#${page.id}" data-site-route="${page.id}">${escapeHtml(page.label)}</a>`).join("")}</nav><button class="preview-cta preview-cta-small" type="button" data-site-route="contact">${escapeHtml(site.cta)}</button></header>
    <div class="preview-topline"><span><i></i> ${escapeHtml(site.city)} · ${escapeHtml(site.audience)}</span><span>${escapeHtml(site.traits.join(" · "))}</span></div>
    <main data-site-page></main>
    <footer class="preview-footer preview-large-footer"><div><p class="preview-eyebrow">${escapeHtml(site.business)}</p><strong>Estamos para ayudarte.</strong><span>${escapeHtml(site.city)} · ${escapeHtml(site.contact)}</span></div><div class="preview-footer-links">${site.pages.slice(1).map((page) => `<a href="#${page.id}" data-site-route="${page.id}">${escapeHtml(page.label)}</a>`).join("")}</div><button class="preview-cta" type="button" data-site-route="contact">${escapeHtml(site.cta)} <b>→</b></button></footer>
    <div class="preview-toast" data-site-toast role="status"></div>
  </div>`;
  const root = mount.querySelector(".preview-site");
  let activeFilter = "Todos";
  const canUseHistory = Boolean(options.fullPage);
  let route = canUseHistory ? initialRoute(root) : "home";
  const navigate = (nextRoute, replace = false) => { route = nextRoute || "home"; if (canUseHistory && !replace) history.pushState({ previewRoute: route }, "", `#${route}`); renderRoute(root, site, route, activeFilter, navigate); updateActiveNav(root, route); };
  root.addEventListener("click", (event) => {
    const target = event.target.closest("[data-site-route], [data-site-action]");
    if (!target) return;
    const next = target.dataset.siteRoute;
    const action = target.dataset.siteAction;
    if (next) { event.preventDefault(); navigate(next); }
    if (action === "filter") { activeFilter = target.dataset.filter || "Todos"; renderRoute(root, site, route, activeFilter, navigate); }
    if (action === "faq") target.closest(".preview-faq-item")?.classList.toggle("is-open");
    if (action === "toast") showToast(root, target.dataset.message || "Solicitud recibida.");
  });
  root.addEventListener("submit", (event) => { if (!event.target.matches("[data-site-form]")) return; event.preventDefault(); showToast(root, "Solicitud recibida. En una implementación real, aquí continuaríamos la conversación."); event.target.reset(); });
  if (canUseHistory) window.addEventListener("popstate", () => { route = initialRoute(root); renderRoute(root, site, route, activeFilter, navigate); updateActiveNav(root, route); });
  renderRoute(root, site, route, activeFilter, navigate);
  updateActiveNav(root, route);
}

function buildSite(answers, recommendation) {
  const family = recommendation.family || "services";
  const copy = FAMILY[family] || FAMILY.services;
  const business = sanitizeText(answers.businessName, 80) || "Tu negocio";
  const city = sanitizeText(answers.city, 80) || "Tu ciudad";
  const traits = String(answers.visualTraits || answers.visualStyle || "Moderno").split("|").filter(Boolean);
  const products = splitList(answers.mainProducts || answers.description);
  const baseItems = products.length ? products : ["Propuesta principal", "Selección destacada", "Atención personalizada", "Solución a tu medida"];
  const items = Array.from({ length: Math.max(8, baseItems.length) }, (_, index) => ({ name: baseItems[index % baseItems.length], index }));
  const pages = buildPages(family, recommendation, copy);
  const images = IMAGE_LIBRARY[family] || IMAGE_LIBRARY.services;
  return { family, business, city, contact: sanitizeText(answers.whatsapp || answers.email || "Contacto directo", 100), audience: sanitizeText(answers.audience || "personas que buscan una mejor opción", 90), traits, primary: answers.primaryColor || "#2f7de1", accent: answers.accentColor || "#6ac13b", fontFamily: fontFamilyFor(answers.typography), logo: answers.logoDataUrl, cta: copy.cta, tone: copy.tone, hero: customHero(answers, copy.hero), description: businessDescription(answers, family), pages, items, images, included: recommendation.included || [], layout: resolveLayout(traits, family), offerLabel: copy.offer, offerPlural: copy.offerPlural };
}

function buildPages(family, recommendation, copy) {
  const pages = [{ id: "home", label: "Inicio" }, { id: "catalog", label: copy.offer }, { id: "story", label: family === "corporate" ? "Empresa" : "Nosotros" }];
  if (family === "corporate" || family === "services") pages.push({ id: "sectors", label: copy.offerPlural });
  pages.push({ id: "gallery", label: "Galería" });
  pages.push({ id: "contact", label: recommendation.included?.includes("Agenda") ? "Agenda" : "Contacto" });
  return pages.slice(0, 6);
}

function renderRoute(root, site, route, filter, navigate) {
  const page = root.querySelector("[data-site-page]");
  if (!page) return;
  const [view, rawIndex] = String(route || "home").split(":");
  const index = Number(rawIndex);
  if (view === "detail" && site.items[index]) page.innerHTML = renderDetail(site, site.items[index]);
  else if (view === "catalog") page.innerHTML = renderCatalog(site, filter);
  else if (view === "story") page.innerHTML = renderStory(site);
  else if (view === "sectors") page.innerHTML = renderSectors(site);
  else if (view === "gallery") page.innerHTML = renderGallery(site);
  else if (view === "contact") page.innerHTML = renderContact(site);
  else page.innerHTML = renderHome(site);
  page.querySelectorAll("[data-site-route]").forEach((element) => element.addEventListener("click", (event) => { event.preventDefault(); navigate(element.dataset.siteRoute); }));
}

function renderHome(site) { return `<section class="preview-page preview-home-page"><div class="preview-home-hero"><div><p class="preview-eyebrow">${escapeHtml(site.tone)}</p><h1>${escapeHtml(site.hero)}</h1><p>${escapeHtml(site.description)}</p><div class="preview-hero-actions"><button class="preview-cta" type="button" data-site-route="catalog">${escapeHtml(site.cta)}</button><button class="preview-secondary" type="button" data-site-route="contact">Hablemos <b>→</b></button></div></div><div class="preview-home-image"><img src="${imageUrl(site.images[0])}" alt="${escapeAttr(site.business)}" loading="eager" onerror="this.hidden=true"><span>${escapeHtml(site.city)}</span></div></div><div class="preview-home-intro"><span>Una propuesta construida alrededor de</span><strong>${escapeHtml(site.business)}</strong><span>y de las personas que la eligen.</span></div><div class="preview-section-heading"><div><p class="preview-eyebrow">Descubre</p><h2>Lo que hacemos mejor</h2></div><a class="preview-text-button" href="#catalog" data-site-route="catalog">Explorar todo →</a></div><div class="preview-product-grid preview-home-grid">${site.items.slice(0, 4).map((item, index) => renderItem(site, item, index)).join("")}</div><div class="preview-home-story"><img src="${imageUrl(site.images[1])}" alt="${escapeAttr(site.business)}" loading="lazy" onerror="this.hidden=true"><div><p class="preview-eyebrow">Una forma distinta de hacerlo</p><h2>Lo que necesitas, sin complicaciones.</h2><p>${escapeHtml(site.description)}</p><a class="preview-secondary" href="#story" data-site-route="story">Conoce más <b>→</b></a></div></div><div class="preview-home-cta"><p class="preview-eyebrow">¿Lo platicamos?</p><h2>El siguiente paso empieza aquí.</h2><button class="preview-cta" type="button" data-site-route="contact">${escapeHtml(site.cta)} <b>→</b></button></div></section>`; }

function renderCatalog(site, filter) { const categories = ["Todos", ...new Set(site.items.slice(0, 4).map((item) => titleCase(item.name.split(" ")[0])))]; const visible = filter === "Todos" ? site.items : site.items.filter((item) => titleCase(item.name.split(" ")[0]) === filter); return `<section class="preview-page preview-inner-page"><div class="preview-page-heading"><p class="preview-eyebrow">${escapeHtml(site.tone)}</p><h1>${escapeHtml(site.offerLabel)}</h1><p>Explora una selección pensada para encontrar justo lo que buscas.</p></div><div class="preview-filter-row">${categories.map((category) => `<button type="button" class="${category === filter ? "is-active" : ""}" data-site-action="filter" data-filter="${escapeAttr(category)}">${escapeHtml(category)}</button>`).join("")}</div><div class="preview-product-grid preview-catalog-grid">${visible.map((item) => renderItem(site, item, item.index)).join("")}</div></section>`; }

function renderItem(site, item, index) { return `<article class="preview-product-card"><a class="preview-product-image" href="#detail:${item.index}" data-site-route="detail:${item.index}"><img src="${imageUrl(site.images[index % site.images.length])}" alt="${escapeAttr(item.name)}" loading="lazy" onerror="this.hidden=true"><span>0${(index % 9) + 1}</span></a><div class="preview-product-body"><small>${escapeHtml(site.offerLabel)}</small><strong>${escapeHtml(titleCase(item.name))}</strong><p>${index % 2 ? "A tu medida" : "Disponible para ti"}</p><a href="#detail:${item.index}" data-site-route="detail:${item.index}">Conocer más <b>↗</b></a></div></article>`; }

function renderDetail(site, item) { return `<section class="preview-page preview-detail-page"><a class="preview-back-link" href="#catalog" data-site-route="catalog">← Volver a ${escapeHtml(site.offerLabel)}</a><div class="preview-detail-layout"><div class="preview-detail-gallery"><img src="${imageUrl(site.images[item.index % site.images.length])}" alt="${escapeAttr(item.name)}" loading="eager" onerror="this.hidden=true"><div>${site.images.map((image) => `<img src="${imageUrl(image)}" alt="${escapeAttr(item.name)}" loading="lazy" onerror="this.hidden=true">`).join("")}</div></div><div class="preview-detail-copy"><p class="preview-eyebrow">${escapeHtml(site.business)}</p><h1>${escapeHtml(titleCase(item.name))}</h1><p>${escapeHtml(site.description)}</p><ul><li>Información clara y fácil de consultar</li><li>Atención cercana para resolver dudas</li><li>Un siguiente paso pensado para ti</li></ul><button class="preview-cta" type="button" data-site-route="contact">Solicitar información <b>→</b></button></div></div><div class="preview-related"><p class="preview-eyebrow">También puede interesarte</p><div class="preview-product-grid">${site.items.filter((candidate) => candidate.index !== item.index).slice(0, 4).map((candidate) => renderItem(site, candidate, candidate.index)).join("")}</div></div></section>`; }

function renderStory(site) { return `<section class="preview-page preview-story-page"><div class="preview-page-heading"><p class="preview-eyebrow">${escapeHtml(site.tone)}</p><h1>Una historia que se nota en cada detalle.</h1><p>${escapeHtml(site.description)}</p></div><div class="preview-story-feature"><img src="${imageUrl(site.images[1])}" alt="${escapeAttr(site.business)}" loading="lazy" onerror="this.hidden=true"><div><p class="preview-eyebrow">Nuestra forma de trabajar</p><h2>Claridad para elegir. Confianza para volver.</h2><p>Conoce una propuesta construida para hacer más sencillo el encuentro entre lo que ofrecemos y lo que estás buscando.</p></div></div><div class="preview-values"><article><strong>01</strong><h3>Atención</h3><p>Escuchamos antes de proponer.</p></article><article><strong>02</strong><h3>Calidad</h3><p>Cuidamos lo que sí importa.</p></article><article><strong>03</strong><h3>Confianza</h3><p>Hacemos claro el siguiente paso.</p></article></div></section>`; }

function renderSectors(site) { return `<section class="preview-page preview-inner-page"><div class="preview-page-heading"><p class="preview-eyebrow">${escapeHtml(site.offerPlural)}</p><h1>Soluciones para distintos retos.</h1><p>Una forma clara de entender cómo podemos aportar valor.</p></div><div class="preview-sector-grid">${["Conoce nuestras capacidades", "Encuentra una ruta a tu medida", "Hablemos de tu siguiente proyecto", "Información para decidir mejor"].map((title, index) => `<article><span>0${index + 1}</span><h2>${title}</h2><p>${escapeHtml(site.description)}</p><button type="button" class="preview-text-button" data-site-route="contact">Consultar →</button></article>`).join("")}</div></section>`; }

function renderGallery(site) { return `<section class="preview-page preview-inner-page"><div class="preview-page-heading"><p class="preview-eyebrow">${escapeHtml(site.business)}</p><h1>Un vistazo más de cerca.</h1><p>Detalles que ayudan a imaginar la experiencia completa.</p></div><div class="preview-gallery-grid preview-gallery-large">${[...site.images, ...site.images].slice(0, 6).map((image, index) => `<figure><img src="${imageUrl(image)}" alt="${escapeAttr(site.business)}" loading="lazy" onerror="this.hidden=true"><figcaption>${index % 2 ? "Cada detalle" : "La experiencia"}</figcaption></figure>`).join("")}</div></section>`; }

function renderContact(site) { return `<section class="preview-page preview-contact-page"><div class="preview-page-heading"><p class="preview-eyebrow">${escapeHtml(site.business)}</p><h1>Cuéntanos qué estás buscando.</h1><p>Estamos listos para orientarte y encontrar la mejor forma de ayudarte.</p></div><div class="preview-contact-layout"><form data-site-form><label>Tu nombre<input required name="name" placeholder="Nombre"></label><label>Tu correo o teléfono<input required name="contact" placeholder="¿Cómo te contactamos?"></label><label>Mensaje<textarea required name="message" placeholder="Cuéntanos un poco más"></textarea></label><button class="preview-cta" type="submit">Enviar solicitud <b>→</b></button></form><aside><p class="preview-eyebrow">Encuéntranos</p><h2>${escapeHtml(site.city)}</h2><p>${escapeHtml(site.contact)}</p><button class="preview-secondary" type="button" data-site-action="toast" data-message="Contacto simulado listo.">Contactar directamente</button></aside></div><div class="preview-faq"><div><p class="preview-eyebrow">Antes de escribirnos</p><h2>Preguntas frecuentes</h2></div><div>${["¿Cómo puedo comenzar?", "¿Puedo recibir una propuesta personalizada?", "¿Cuándo puedo contactarlos?"] .map((question) => `<div class="preview-faq-item"><button type="button" data-site-action="faq">${question}<b>+</b></button><p>Claro. Esta experiencia puede adaptarse a tus necesidades y al siguiente paso que quieras dar.</p></div>`).join("")}</div></div></section>`; }

function updateActiveNav(root, route) { const view = String(route).split(":")[0]; root.querySelectorAll(".preview-links a").forEach((link) => link.classList.toggle("is-active", link.dataset.siteRoute === view)); }
function initialRoute(root) { return String(location.hash || "#home").slice(1) || "home"; }
function showToast(root, message) { const toast = root.querySelector("[data-site-toast]"); if (!toast) return; toast.textContent = message; toast.classList.add("is-visible"); window.setTimeout(() => toast.classList.remove("is-visible"), 3500); }
function splitList(value) { return sanitizeText(value, 260).split(/[,;|\n]+/).map((item) => item.trim()).filter((item) => item.length > 2).slice(0, 8); }
function businessDescription(answers, family) { const text = sanitizeText(answers.description || answers.mainProducts, 200); return text || (family === "stores" ? "Encuentra productos y atención pensados para hacerte la vida más sencilla." : "Conoce nuestra propuesta, encuentra lo que necesitas y da el siguiente paso con confianza."); }
function customHero(answers, fallback) { const business = sanitizeText(answers.businessName, 80); if (!business) return fallback; if (answers.needsAppointments) return `${business}, atención cuando la necesitas`; if (answers.needsOrders) return `${business}: pedir es más fácil`; return `${business}, hecho para dejar huella`; }
function resolveLayout(traits, family) { const value = normalize(traits.join(" ")); if (value.includes("editorial") || value.includes("elegante") || family === "creative") return "editorial"; if (value.includes("corporativo") || value.includes("tecnologico") || family === "corporate") return "structured"; if (value.includes("audaz")) return "bold"; if (value.includes("calido") || value.includes("natural") || family === "restaurants") return "immersive"; return "commerce"; }
function imageUrl(id) { return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82&ixlib=rb-4.1.0`; }
function fontFamilyFor(name = "Inter") { const fonts = { Inter: "Inter, sans-serif", Saira: "Saira, sans-serif", Montserrat: "Montserrat, sans-serif", Poppins: "Poppins, sans-serif", "Space Grotesk": "'Space Grotesk', sans-serif", Raleway: "Raleway, sans-serif", "Playfair Display": "'Playfair Display', serif", "DM Serif Display": "'DM Serif Display', serif", Oswald: "Oswald, sans-serif" }; return fonts[name] || fonts.Inter; }
function normalize(value) { return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function titleCase(value) { return String(value || "").toLocaleLowerCase("es-MX").replace(/(^|[\s-])([a-záéíóúñ])/g, (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("es-MX")}`); }
function escapeHtml(value) { return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
function escapeAttr(value) { return escapeHtml(value).replace(/`/g, "&#096;"); }
