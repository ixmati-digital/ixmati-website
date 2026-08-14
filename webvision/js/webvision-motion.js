export function initMotionFX() {
  rotateHeroTicker();
  initMagneticButtons();
  initCursorParallax();
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const laptop = window.matchMedia("(max-width: 1240px)").matches;
  const mobile = window.matchMedia("(max-width: 620px)").matches;
  const floatDistance = mobile ? 6 : laptop || coarsePointer ? 9 : 14;
  const chipDistance = mobile ? 7 : laptop || coarsePointer ? 10 : 18;
  window.gsap.set([".wv-hero-copy > *", ".wv-vision-stage"], { opacity: 0, y: 26 });
  window.gsap.timeline({ defaults: { ease: "power3.out" } })
    .to(".wv-hero-copy > *", { opacity: 1, y: 0, duration: 0.78, stagger: 0.08 })
    .to(".wv-vision-stage", { opacity: 1, y: 0, duration: 0.9 }, "-=0.55");
  window.gsap.to(".wv-device-stack", { y: -floatDistance, rotateX: coarsePointer ? 0 : 2, rotateY: coarsePointer ? 0 : -3, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
  window.gsap.to(".wv-floating-chip", { y: -chipDistance, duration: 2.4, stagger: 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" });
  window.gsap.to(".wv-holo-ring", { rotate: 360, duration: 22, repeat: -1, ease: "none" });
}

export function animateStartTransition(done) {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    done?.();
    return;
  }
  window.gsap.to(".wv-hero-premium", { opacity: 0, y: -18, scale: 0.98, duration: 0.36, ease: "power2.in", onComplete: done });
}

export function pulseSelection(element) {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !element) return;
  window.gsap.fromTo(element, { scale: 0.98 }, { scale: 1, duration: 0.28, ease: "back.out(2)" });
}

export function animatePriceChange(element) {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !element) return;
  window.gsap.fromTo(element, { y: 8, opacity: 0.45 }, { y: 0, opacity: 1, duration: 0.28 });
}

export function animatePriceCounter(element, value, formatter) {
  if (!element) return;
  const runId = String(Date.now() + Math.random());
  element.dataset.counterRun = runId;
  element.textContent = formatter(value);
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const state = { amount: Math.max(0, value * 0.96) };
  window.gsap.to(state, {
    amount: value,
    duration: 0.8,
    ease: "power3.out",
    onUpdate: () => {
      if (element.dataset.counterRun !== runId) return;
      element.textContent = formatter(Math.round(state.amount / 50) * 50);
    },
    onComplete: () => {
      if (element.dataset.counterRun !== runId) return;
      element.textContent = formatter(value);
    }
  });
}

export function runGenerationVisual() {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const gsap = window.gsap;
  gsap.fromTo(".wv-gen-node", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.14, ease: "back.out(2)" });
  gsap.fromTo(".wv-gen-wire", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.9, stagger: 0.18, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.fromTo(".wv-gen-frame span", { opacity: 0, y: 18, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.16, repeat: -1, repeatDelay: 0.7, yoyo: true });
}

export function revealSimulation() {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const gsap = window.gsap;
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .fromTo(".wv-reveal .wv-kicker", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35 })
    .fromTo(".wv-reveal h2", { opacity: 0, y: 18, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.52 }, "-=0.08")
    .fromTo(".wv-reveal-stage", { opacity: 0, y: 44, scale: 0.96, filter: "blur(14px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.72 }, "-=0.1")
    .fromTo(".wv-reveal-stage .preview-nav", { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.34 }, "-=0.15")
    .fromTo(".wv-reveal-stage .preview-hero > *", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, "-=0.05")
    .fromTo(".wv-reveal-stage .preview-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.32, stagger: 0.06 }, "-=0.1");
}

export function celebrateReveal() {
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.gsap.fromTo(".wv-estimate", { boxShadow: "0 0 0 rgba(140,255,102,0)" }, { boxShadow: "0 0 54px rgba(140,255,102,0.34)", duration: 1.2, repeat: 1, yoyo: true });
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

function initMagneticButtons() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) return;
  document.addEventListener("pointermove", (event) => {
    const button = event.target.closest?.(".wv-button");
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
    button.style.transform = `translate(${x}px, ${y}px)`;
  });
  document.addEventListener("pointerout", (event) => {
    const button = event.target.closest?.(".wv-button");
    if (button) button.style.transform = "";
  });
}

function initCursorParallax() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
  document.addEventListener("pointermove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
    const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
    document.documentElement.style.setProperty("--cursor-x", x);
    document.documentElement.style.setProperty("--cursor-y", y);
  }, { passive: true });
}
