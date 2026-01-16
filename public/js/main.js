// Entry point utama
console.log("🚀 Main.js loaded successfully");

// Import fungsi-fungsi yang diperlukan
import {
  updateRefreshTime,
  updateCurrentDate,
  setDefaultData,
  updateRoomStatus,
} from "./utils.js";
import { fetchDataFromBackend } from "./dht22.js";
import { fetchOccupancyFromBackend, setDefaultOccupancy } from "./occupancy.js";
import { fetchACStatusFromBackend, setDefaultACStatus } from "./acStatus.js";
import { fetchFuzzyFromBackend } from "./outputFuzzy.js";
import { setSystemMode, getSystemMode } from "./modeControl.js";
import {
  initBoundingBox,
  showSnapshotModal,
  hideSnapshotModal,
  cleanupBoundingBox,
} from "./boundingBox.js";

let intervalIds = [];

// Initialize ketika DOM sudah dimuat
document.addEventListener("DOMContentLoaded", async function () {
  console.log("📋 DOM fully loaded, initializing application...");

  // Update waktu dan tanggal
  updateRefreshTime();
  updateCurrentDate();

  // Set semua data ke default (-)
  setDefaultData();
  setDefaultOccupancy();
  setDefaultACStatus();

  // Setup event listeners
  setupModeButtons();
  setupModal();
  initBoundingBox();

  // Cek Mode Terakhir dari Database saat awal load
  await syncInitialMode();

  // Fetch data dari backend pertama kali
  fetchAllData();

  // Gunakan fungsi startPolling untuk memulai interval data
  startPolling();

  // Update refresh time every 10 seconds (Jam tetap jalan terus)
  setInterval(updateRefreshTime, 10000);

  console.log("✅ Application initialization complete!");
});

function fetchAllData() {
  fetchDataFromBackend();
  fetchOccupancyFromBackend();
  fetchACStatusFromBackend();
  fetchFuzzyFromBackend();
}

function startPolling() {
  // Cek agar tidak double interval
  if (intervalIds.length > 0) return;

  console.log("🔄 Starting Auto-Refresh...");
  const id1 = setInterval(fetchDataFromBackend, 10000);
  const id2 = setInterval(fetchOccupancyFromBackend, 10000);
  const id3 = setInterval(fetchACStatusFromBackend, 10000);
  const id4 = setInterval(fetchFuzzyFromBackend, 10000);

  intervalIds.push(id1, id2, id3, id4);
}

function stopPolling() {
  console.log("⏸️ Pausing Auto-Refresh (User Editing)...");
  intervalIds.forEach((id) => clearInterval(id));
  intervalIds = [];
}

// Variabel global untuk modal elements
let modal, closeBtn, cancelBtn, applyBtn;
let acFrontSwitch, acFrontStatus, acFrontTemperature, acFrontTemperatureValue;
let acSideSwitch, acSideStatus, acSideTemperature, acSideTemperatureValue;

async function syncInitialMode() {
  try {
    const currentStatus = await getSystemMode();
    if (currentStatus) {
      console.log("ℹ️ Initial System Mode:", currentStatus.mode);
      updateModeUI(currentStatus.mode);
    }
  } catch (error) {
    console.error("Gagal sync mode awal:", error);
  }
}

function updateModeUI(mode) {
  const manualBtn = document.getElementById("manual-mode-btn");
  const autoBtn = document.getElementById("auto-mode-btn");
  const modeIndicator = document.getElementById("mode-indicator");
  const modal = document.getElementById("manual-modal");

  if (!manualBtn || !autoBtn) return;

  if (mode === "manual") {
    // Tampilan Manual Aktif
    manualBtn.classList.add("btn-active");
    manualBtn.classList.remove("btn-outline");
    autoBtn.classList.add("btn-outline");
    autoBtn.classList.remove("btn-primary", "btn-active");

    manualBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Manual Mode';
    autoBtn.innerHTML = '<i class="fas fa-robot"></i> Automatic Mode';

    if (modeIndicator) {
      modeIndicator.className = "mode-indicator manual";
      modeIndicator.innerHTML = '<i class="fas fa-hand-paper"></i> Manual Mode';
    }
  } else {
    // Tampilan Auto Aktif
    autoBtn.classList.add("btn-primary", "btn-active");
    autoBtn.classList.remove("btn-outline");
    manualBtn.classList.add("btn-outline");
    manualBtn.classList.remove("btn-active");

    manualBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Manual Mode';
    autoBtn.innerHTML = '<i class="fas fa-robot"></i> Auto Mode';

    if (modeIndicator) {
      modeIndicator.className = "mode-indicator auto";
      modeIndicator.innerHTML = '<i class="fas fa-robot"></i> Auto Mode';
    }

    // Kalau pindah ke Auto, tutup modal manual otomatis
    if (modal) modal.style.display = "none";
  }
}

// Fungsi untuk setup event listeners pada button mode
function setupModeButtons() {
  const manualBtn = document.getElementById("manual-mode-btn");
  const autoBtn = document.getElementById("auto-mode-btn");

  if (!manualBtn || !autoBtn) return;

  // Open modal when Manual Mode is clicked
  manualBtn.addEventListener("click", async function () {
    updateModeUI("manual"); // ✅ Update UI pakai helper
    showManualModal();

    try {
      await setSystemMode("manual");
    } catch (error) {
      console.error("Failed to set manual mode:", error);
    }
  });

  // Return to automatic mode
  autoBtn.addEventListener("click", async function () {
    updateModeUI("auto"); // ✅ Update UI pakai helper
    hideManualModal();

    try {
      await setSystemMode("auto");
    } catch (error) {
      console.error("Failed to set auto mode:", error);
    }
  });
}

// Fungsi untuk setup modal manual control
function setupModal() {
  modal = document.getElementById("manual-modal");
  closeBtn = document.querySelector(".close");
  cancelBtn = document.getElementById("cancel-changes");
  applyBtn = document.getElementById("apply-changes");

  acFrontSwitch = document.getElementById("ac-front-switch");
  acFrontStatus = document.getElementById("ac-front-status");
  acFrontTemperature = document.getElementById("ac-front-temperature");
  acFrontTemperatureValue = document.getElementById(
    "ac-front-temperature-value"
  );

  acSideSwitch = document.getElementById("ac-side-switch");
  acSideStatus = document.getElementById("ac-side-status");
  acSideTemperature = document.getElementById("ac-side-temperature");
  acSideTemperatureValue = document.getElementById("ac-side-temperature-value");

  // Close modal events
  if (closeBtn) closeBtn.addEventListener("click", hideManualModal);
  if (cancelBtn) cancelBtn.addEventListener("click", hideManualModal);
  if (modal) {
    window.addEventListener("click", (e) => {
      if (e.target === modal) hideManualModal();
    });
  }

  // Apply Changes
  if (applyBtn) {
    applyBtn.addEventListener("click", applyManualChanges);
  }

  // Setup View Snapshot
  const viewSnapshotBtn = document.getElementById("view-snapshot-btn");
  const closeSnapshotBtn = document.querySelector(".close-snapshot");
  if (viewSnapshotBtn)
    viewSnapshotBtn.addEventListener("click", showSnapshotModal);
  if (closeSnapshotBtn)
    closeSnapshotBtn.addEventListener("click", hideSnapshotModal);

  // Update Status Text Realtime di Modal
  if (acFrontSwitch && acFrontStatus) {
    acFrontSwitch.addEventListener("change", function () {
      acFrontStatus.textContent = acFrontSwitch.checked ? "ON" : "OFF";
      const tempControl = document.getElementById(
        "ac-front-temperature-control"
      );
      if (tempControl)
        tempControl.style.display = acFrontSwitch.checked ? "block" : "none";
    });
  }

  if (acSideSwitch && acSideStatus) {
    acSideSwitch.addEventListener("change", function () {
      acSideStatus.textContent = acSideSwitch.checked ? "ON" : "OFF";
      const tempControl = document.getElementById(
        "ac-side-temperature-control"
      );
      if (tempControl)
        tempControl.style.display = acSideSwitch.checked ? "block" : "none";
    });
  }

  // Setup Temperature Display dengan DUA SUHU TERPISAH
  if (acFrontTemperature) {
    acFrontTemperature.addEventListener("input", function () {
      if (acFrontTemperatureValue) {
        acFrontTemperatureValue.textContent = this.value + "°C";
      }
      console.log(`🎚️ Front slider changed to: ${this.value}°C`);
    });
  }

  if (acSideTemperature) {
    acSideTemperature.addEventListener("input", function () {
      if (acSideTemperatureValue) {
        acSideTemperatureValue.textContent = this.value + "°C";
      }
      console.log(`🎚️ Side slider changed to: ${this.value}°C`);
    });
  }
}

// Fungsi menampilkan modal
function showManualModal() {
  stopPolling();

  const modal = document.getElementById("manual-modal");
  if (modal) {
    modal.style.display = "block";

    // Sinkronisasi status saat ini ke modal
    const acFrontElement = document.getElementById("ac-front");
    const acSideElement = document.getElementById("ac-side");

    if (acFrontElement) {
      const currentStatus =
        acFrontElement.querySelector(".ac-status").textContent;
      // Gunakan includes untuk safety jika ada spasi
      const isOn = currentStatus.includes("ON");
      acFrontSwitch.checked = isOn;
      acFrontStatus.textContent = isOn ? "ON" : "OFF";
      const tempControl = document.getElementById(
        "ac-front-temperature-control"
      );
      if (tempControl) tempControl.style.display = isOn ? "block" : "none";
    }

    if (acSideElement) {
      const currentStatus =
        acSideElement.querySelector(".ac-status").textContent;
      const isOn = currentStatus.includes("ON");
      acSideSwitch.checked = isOn;
      acSideStatus.textContent = isOn ? "ON" : "OFF";
      const tempControl = document.getElementById(
        "ac-side-temperature-control"
      );
      if (tempControl) tempControl.style.display = isOn ? "block" : "none";
    }
  }
}

function hideManualModal() {
  const modal = document.getElementById("manual-modal");
  if (modal) modal.style.display = "none";

  startPolling();
}

async function applyManualChanges() {
  console.log("✅ Apply changes clicked");

  let tempFrontValue = 22; // Default suhu depan
  let tempSideValue = 22; // Default suhu samping

  // Ambil nilai suhu depan
  if (acFrontTemperature && acFrontTemperature.value) {
    const parsedVal = parseInt(acFrontTemperature.value);
    if (!isNaN(parsedVal)) {
      tempFrontValue = parsedVal;
    }
  }

  // Ambil nilai suhu samping
  if (acSideTemperature && acSideTemperature.value) {
    const parsedVal = parseInt(acSideTemperature.value);
    if (!isNaN(parsedVal)) {
      tempSideValue = parsedVal;
    }
  }

  const manualStatePayload = {
    acFront: acFrontSwitch.checked ? "ON" : "OFF",
    acSide: acSideSwitch.checked ? "ON" : "OFF",
    temperatureFront: tempFrontValue,
    temperatureSide: tempSideValue,
  };

  // Debug: Tampilkan nilai slider
  console.log("🔍 Slider values:");
  console.log(
    `   Front: ${
      acFrontTemperature ? acFrontTemperature.value : "N/A"
    }°C → ${tempFrontValue}°C`
  );
  console.log(
    `   Side: ${
      acSideTemperature ? acSideTemperature.value : "N/A"
    }°C → ${tempSideValue}°C`
  );

  try {
    console.log(
      "📡 Sending Manual Config to Backend & MQTT...",
      manualStatePayload
    );

    // Panggil setSystemMode dengan parameter lengkap
    const result = await setSystemMode("manual", manualStatePayload);
    console.log("✅ Manual config applied successfully:", result);

    // Update Tampilan Dashboard
    const acFrontElement = document.getElementById("ac-front");
    if (acFrontElement) {
      const statusEl = acFrontElement.querySelector(".ac-status");
      const tempEl = acFrontElement.querySelector(".ac-temperature");

      if (acFrontSwitch.checked) {
        statusEl.textContent = "ON";
        statusEl.className = "ac-status status-on";
        tempEl.textContent = tempFrontValue + " °C";
      } else {
        statusEl.textContent = "OFF";
        statusEl.className = "ac-status status-off";
        tempEl.textContent = "- °C";
      }
    }

    const acSideElement = document.getElementById("ac-side");
    if (acSideElement) {
      const statusEl = acSideElement.querySelector(".ac-status");
      const tempEl = acSideElement.querySelector(".ac-temperature");

      if (acSideSwitch.checked) {
        statusEl.textContent = "ON";
        statusEl.className = "ac-status status-on";
        tempEl.textContent = tempSideValue + " °C"; // ← Gunakan tempSideValue
      } else {
        statusEl.textContent = "OFF";
        statusEl.className = "ac-status status-off";
        tempEl.textContent = "- °C";
      }
    }

    updateRoomStatus();
    hideManualModal();
  } catch (error) {
    console.error("❌ Failed to apply manual config:", error);
    alert("Gagal menghubungi server! Cek koneksi backend.");
    hideManualModal();
  }
}

// Fetch API
async function sendACCommand(data) {
  const API_URL = "http://localhost:5000/api/ac-status/control";

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }
  return await response.json();
}

window.addEventListener("beforeunload", cleanupBoundingBox);

// Global Exports
window.showManualModal = showManualModal;
window.hideManualModal = hideManualModal;
window.applyManualChanges = applyManualChanges;
window.showSnapshotModal = showSnapshotModal;
window.hideSnapshotModal = hideSnapshotModal;
