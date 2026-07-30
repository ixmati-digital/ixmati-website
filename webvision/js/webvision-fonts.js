const OPTIONAL_FONT_HREF = "https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700;900&family=Playfair+Display:wght@600;800&family=Poppins:wght@500;700;900&family=Space+Grotesk:wght@500;700&family=DM+Serif+Display&family=Oswald:wght@500;700&family=Raleway:wght@500;800&display=swap";

export function loadOptionalFonts() {
  const load = () => {
    if (document.querySelector("link[data-webvision-optional-fonts]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = OPTIONAL_FONT_HREF;
    link.dataset.webvisionOptionalFonts = "true";
    document.head.appendChild(link);
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(load, { timeout: 1800 });
  } else {
    window.setTimeout(load, 1200);
  }
}
