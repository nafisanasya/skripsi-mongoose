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

  // Pastikan semua elemen ada (Termasuk elemen di dalam Modal Popup)
  const requiredElements = [
    // --- Dashboard Utama ---
    "manual-mode-btn",
    "auto-mode-btn",
    "sensor-front",
    "sensor-side",
    "sensor-back",
    "ac-front",
    "ac-side",

    // --- Modal Manual Control ---
    "manual-modal", // Popup Container
    "apply-changes", // Tombol Apply
    "cancel-changes", // Tombol Cancel

    // --- Kontrol AC Depan (Front) ---
    "ac-front-switch", // Toggle ON/OFF
    "ac-front-status", // Teks status
    "ac-front-temperature", // Slider suhu

    // --- Kontrol AC Samping (Side) ---
    "ac-side-switch", // Toggle ON/OFF
    "ac-side-status", // Teks status
    "ac-side-temperature", // Slider suhu
  ];

  requiredElements.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) {
      if (DEBUG) console.error(`❌ Missing element: ${id}`);
    } else if (DEBUG) {
      console.log(`✅ Element found: ${id}`);
    }
  });

  // PERBAIKAN: Setup event listener untuk tombol Apply
  setupManualControl();
}

// Fungsi untuk setup manual control
function setupManualControl() {
  const applyButton = document.getElementById("apply-changes");

  if (!applyButton) {
    console.error("❌ Apply button tidak ditemukan!");
    return;
  }

  applyButton.addEventListener("click", async function () {
    console.log("🔴 ======== APPLY BUTTON CLICKED ========");

    // Ambil nilai dari slider
    const sliderFront = document.getElementById("ac-front-temperature");
    const sliderSide = document.getElementById("ac-side-temperature");
    const toggleFront = document.getElementById("ac-front-switch");
    const toggleSide = document.getElementById("ac-side-switch");

    // Validasi elemen
    if (!sliderFront || !sliderSide || !toggleFront || !toggleSide) {
      console.error("❌ Error: Element tidak ditemukan!");
      return;
    }

    // Ambil nilai
    const frontTemp = parseInt(sliderFront.value);
    const sideTemp = parseInt(sliderSide.value);
    const acFrontStatus = toggleFront.checked ? "ON" : "OFF";
    const acSideStatus = toggleSide.checked ? "ON" : "OFF";

    console.log(`🎚️ Front slider: ${frontTemp}°C, Side slider: ${sideTemp}°C`);
    console.log(`🔌 Status: Front ${acFrontStatus}, Side ${acSideStatus}`);

    // Siapkan data manual dengan DUA SUHU TERPISAH
    const manualData = {
      acFront: acFrontStatus,
      acSide: acSideStatus,
      temperatureFront: frontTemp,
      temperatureSide: sideTemp,
    };

    console.log("📤 Data manual:", manualData);

    try {
      // Import dinamis untuk menghindari circular dependency
      const { setSystemMode } = await import("./modeControl.js");

      // Kirim ke backend
      const result = await setSystemMode("manual", manualData);
      console.log("✅ Berhasil mengirim ke backend:", result);

      // Tutup modal
      const modal = document.getElementById("manual-modal");
      if (modal) modal.style.display = "none";
    } catch (error) {
      console.error("❌ Gagal mengirim data:", error);
      alert("Gagal mengirim pengaturan ke AC!");
    }
  });

  // Setup cancel button
  const cancelButton = document.getElementById("cancel-changes");
  if (cancelButton) {
    cancelButton.addEventListener("click", function () {
      const modal = document.getElementById("manual-modal");
      if (modal) modal.style.display = "none";
    });
  }

  // Setup manual/auto mode buttons
  const manualBtn = document.getElementById("manual-mode-btn");
  const autoBtn = document.getElementById("auto-mode-btn");

  if (manualBtn) {
    manualBtn.addEventListener("click", async function () {
      console.log("📱 Manual mode button clicked");

      // Buka modal
      const modal = document.getElementById("manual-modal");
      if (modal) modal.style.display = "block";

      // Import dan set mode ke manual (tanpa data AC)
      try {
        const { setSystemMode } = await import("./modeControl.js");
        await setSystemMode("manual");
      } catch (error) {
        console.error("❌ Error setting manual mode:", error);
      }
    });
  }

  if (autoBtn) {
    autoBtn.addEventListener("click", async function () {
      console.log("🤖 Auto mode button clicked");

      try {
        const { setSystemMode } = await import("./modeControl.js");
        await setSystemMode("auto");
      } catch (error) {
        console.error("❌ Error setting auto mode:", error);
      }
    });
  }

  if (DEBUG) console.log("✅ Manual control initialized");
}

export { initializeDOMElements };
