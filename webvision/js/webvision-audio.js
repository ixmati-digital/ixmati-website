let enabled = false;
let audioContext = null;

export function initImmersiveAudio(toggle) {
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    enabled = !enabled;
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.classList.toggle("is-active", enabled);
    playCue("click");
  });
}

export function playCue(type = "click") {
  if (!enabled) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;
    const frequency = cueFrequency(type);
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.35, now + 0.08);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.025, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  } catch (error) {
    enabled = false;
  }
}

function cueFrequency(type) {
  if (type === "reveal") return 660;
  if (type === "generate") return 440;
  if (type === "whoosh") return 520;
  return 360;
}
