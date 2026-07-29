const INTRO_SESSION_KEY = "ixmati_webvision_intro_seen";

export function runIntro({ onReady } = {}) {
  const intro = document.querySelector(".wv-intro");
  const introSeen = sessionStorage.getItem(INTRO_SESSION_KEY) === "true";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (introSeen || reduceMotion) {
    if (intro) {
      intro.hidden = true;
      intro.style.display = "none";
    }
    onReady?.();
    return;
  }

  if (!window.gsap) {
    window.setTimeout(() => {
      sessionStorage.setItem(INTRO_SESSION_KEY, "true");
      onReady?.();
    }, 2200);
    return;
  }

  window.gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      sessionStorage.setItem(INTRO_SESSION_KEY, "true");
      onReady?.();
    }
  })
    .fromTo(".wv-intro-line", { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.55, ease: "power4.out" })
    .fromTo(".wv-intro-mark", { opacity: 0, rotateY: -38, scale: 0.74 }, { opacity: 1, rotateY: 0, scale: 1, duration: 0.72 }, "-=0.08")
    .fromTo(".wv-intro span", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.58 }, "-=0.28")
    .fromTo(".wv-intro p", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.58 }, "-=0.24")
    .to(".wv-intro", { opacity: 0, scale: 1.04, duration: 0.5, delay: 0.34, pointerEvents: "none" });
}
