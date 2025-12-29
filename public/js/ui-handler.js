import { DEBUG } from "./config.js";

// Initialize DOM elements after page load
function initializeDOMElements() {
  if (DEBUG) console.log("🔄 Initializing DOM elements...");

  // Debug: Log semua elemen penting
  if (DEBUG) {
    console.log(
      "🔍 Manual button:",
      document.getElementById("manual-mode-btn")
    );
    console.log("🔍 Auto button:", document.getElementById("auto-mode-btn"));
    console.log("🔍 Sensor front:", document.getElementById("sensor-front"));
    console.log("🔍 Sensor side:", document.getElementById("sensor-side"));
    console.log("🔍 Sensor back:", document.getElementById("sensor-back"));
    console.log("🔍 AC Front:", document.getElementById("ac-front"));
    console.log("🔍 AC Side:", document.getElementById("ac-side"));
  }

  // Pastikan semua elemen ada
  const requiredElements = [
    "manual-mode-btn",
    "auto-mode-btn",
    "sensor-front",
    "sensor-side",
    "sensor-back",
    "ac-front",
    "ac-side",
  ];

  requiredElements.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) {
      if (DEBUG) console.error(`❌ Missing element: ${id}`);
    } else if (DEBUG) {
      console.log(`✅ Element found: ${id}`);
    }
  });
}

export { initializeDOMElements };
