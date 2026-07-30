export function initLivingBackground() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(pointer: coarse)").matches) return;
  const root = document.documentElement;
  let frame = 0;
  document.addEventListener("pointermove", (event) => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      root.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth) * 100}%`);
      root.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight) * 100}%`);
      frame = 0;
    });
  }, { passive: true });
}
