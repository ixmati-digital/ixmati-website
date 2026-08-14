let activeTransition = null;

export function transitionScene({ from, to, activate, done } = {}) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  activeTransition?.kill();
  activeTransition = null;

  if (!window.gsap || reduceMotion || !from || !to || from === to) {
    activate?.();
    settleScreens(to);
    done?.();
    focusFirstField(to);
    return;
  }

  const beam = ensureBeam();
  prepareScreens(from, to);
  activate?.();
  prepareScreens(from, to);

  activeTransition = window.gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: () => {
      settleScreens(to);
      activeTransition = null;
      done?.();
      focusFirstField(to);
    },
    onInterrupt: () => {
      settleScreens(to);
      activeTransition = null;
    }
  })
    .to(from, { opacity: 0, y: -18, scale: 0.985, filter: "blur(10px)", duration: 0.24, ease: "power2.in" })
    .set(beam, { opacity: 1, scaleX: 0, transformOrigin: "left center" }, 0.06)
    .to(beam, { scaleX: 1, duration: 0.28, ease: "power4.out" }, 0.08)
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

function prepareScreens(from, to) {
  document.querySelectorAll(".wv-screen").forEach((screen) => {
    if (screen === from || screen === to) {
      screen.style.display = "block";
      screen.style.visibility = "visible";
      screen.style.pointerEvents = screen === to ? "auto" : "none";
      return;
    }
    hideScreen(screen);
  });
}

function settleScreens(activeScreen) {
  document.querySelectorAll(".wv-screen").forEach((screen) => {
    if (screen === activeScreen) {
      screen.classList.add("is-active");
      screen.style.display = "block";
      screen.style.visibility = "visible";
      screen.style.opacity = "1";
      screen.style.pointerEvents = "auto";
      screen.style.transform = "none";
      screen.style.filter = "none";
      return;
    }
    screen.classList.remove("is-active");
    hideScreen(screen);
  });
}

function hideScreen(screen) {
  screen.style.display = "none";
  screen.style.visibility = "hidden";
  screen.style.opacity = "0";
  screen.style.pointerEvents = "none";
  screen.style.transform = "none";
  screen.style.filter = "none";
}
