export function initMotionFX() {
  rotateHeroTicker();
  initMagneticButtons();
  initCursorParallax();
  if (!window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.gsap.set([".wv-hero-copy > *", ".wv-vision-stage"], { opacity: 0, y: 26 });
  window.gsap.timeline({ defaults: { ease: "power3.out" } })
    .to(".wv-hero-copy > *", { opacity: 1, y: 0, duration: 0.78, stagger: 0.08 })
    .to(".wv-vision-stage", { opacity: 1, y: 0, duration: 0.9 }, "-=0.55");
  window.gsap.to(".wv-device-stack", { y: -14, rotateX: 3, rotateY: -4, duration: 3.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
  window.gsap.to(".wv-floating-chip", { y: -18, duration: 2.4, stagger: 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" });
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
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
