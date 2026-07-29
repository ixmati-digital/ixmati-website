export function transitionScene({ from, to, done } = {}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || reduceMotion || !from || !to || from === to) {
    done?.();
    focusFirstField(to);
    return;
  }

  const beam = ensureBeam();
  window.gsap.timeline({ defaults: { ease: "power2.out" }, onComplete: () => focusFirstField(to) })
    .to(from, { opacity: 0, y: -18, scale: 0.985, filter: "blur(10px)", duration: 0.24, ease: "power2.in" })
    .set(beam, { opacity: 1, scaleX: 0, transformOrigin: "left center" }, 0.06)
    .to(beam, { scaleX: 1, duration: 0.28, ease: "power4.out" }, 0.08)
    .add(() => done?.(), 0.18)
    .fromTo(to, { opacity: 0, y: 24, scale: 1.015, filter: "blur(12px)" }, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.42 }, 0.2)
    .to(beam, { opacity: 0, duration: 0.22 }, 0.48);
}

export function focusFirstField(scope) {
  const field = scope?.querySelector("input:not([type='hidden']), textarea, select, button");
  if (field && !window.matchMedia("(pointer: coarse)").matches) {
    window.setTimeout(() => field.focus({ preventScroll: true }), 80);
  }
}

function ensureBeam() {
  let beam = document.querySelector(".wv-transition-beam");
  if (!beam) {
    beam = document.createElement("div");
    beam.className = "wv-transition-beam";
    document.body.appendChild(beam);
  }
  return beam;
}
