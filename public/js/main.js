// Main.js - Entry point utama
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
import { setSystemMode } from "./modeControl.js";
import {
  initBoundingBox,
  showSnapshotModal,
  hideSnapshotModal,
  cleanupBoundingBox,
} from "./boundingBox.js";

// Initialize ketika DOM sudah dimuat
document.addEventListener("DOMContentLoaded", function () {
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

  // Fetch data dari backend pertama kali
  fetchDataFromBackend();
  fetchOccupancyFromBackend();
  fetchACStatusFromBackend();

  // Update refresh time every 10 seconds
  setInterval(updateRefreshTime, 10000);

  // Fetch data dari backend setiap 10 detik
  setInterval(fetchDataFromBackend, 10000);
  setInterval(fetchOccupancyFromBackend, 10000);
  setInterval(fetchACStatusFromBackend, 10000);

  console.log("✅ Application initialization complete!");
});

// Variabel global untuk modal elements
let modal, closeBtn, cancelBtn, applyBtn;
let acFrontSwitch, acFrontStatus, acFrontTemperature, acFrontTemperatureValue;
let acSideSwitch, acSideStatus, acSideTemperature, acSideTemperatureValue;

// Fungsi untuk setup event listeners pada button mode
function setupModeButtons() {
  const manualBtn = document.getElementById("manual-mode-btn");
  const autoBtn = document.getElementById("auto-mode-btn");
  const modeIndicator = document.getElementById("mode-indicator");

  if (!manualBtn || !autoBtn) return;

  // Open modal when Manual Mode is clicked
  manualBtn.addEventListener("click", async function () {
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

    showManualModal();

    try {
      await setSystemMode("manual");
    } catch (error) {
      console.error("Failed to set manual mode:", error);
    }
  });

  // Return to automatic mode
  autoBtn.addEventListener("click", async function () {
    autoBtn.classList.add("btn-primary", "btn-active");
    autoBtn.classList.remove("btn-outline");
    manualBtn.classList.add("btn-outline");
    manualBtn.classList.remove("btn-active");

    manualBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Manual Mode';
    autoBtn.innerHTML = '<i class="fas fa-robot"></i> Automatic Mode';

    if (modeIndicator) {
      modeIndicator.className = "mode-indicator auto";
      modeIndicator.innerHTML = '<i class="fas fa-robot"></i> Auto Mode';
    }

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

  // Update Temperature Value
  if (acFrontTemperature) {
    acFrontTemperature.addEventListener("input", function () {
      acFrontTemperatureValue.textContent = acFrontTemperature.value;
    });
  }
  if (acSideTemperature) {
    acSideTemperature.addEventListener("input", function () {
      acSideTemperatureValue.textContent = acSideTemperature.value;
    });
  }
}

// Fungsi menampilkan modal
function showManualModal() {
  const modal = document.getElementById("manual-modal");
  if (modal) {
    modal.style.display = "block";

    // Sinkronisasi status saat ini ke modal
    const acFrontElement = document.getElementById("ac-front");
    const acSideElement = document.getElementById("ac-side");

    if (acFrontElement) {
      const currentStatus =
        acFrontElement.querySelector(".ac-status").textContent;
      acFrontSwitch.checked = currentStatus === "ON";
      acFrontStatus.textContent = currentStatus;
      const tempControl = document.getElementById(
        "ac-front-temperature-control"
      );
      if (tempControl)
        tempControl.style.display = currentStatus === "ON" ? "block" : "none";
    }

    if (acSideElement) {
      const currentStatus =
        acSideElement.querySelector(".ac-status").textContent;
      acSideSwitch.checked = currentStatus === "ON";
      acSideStatus.textContent = currentStatus;
      const tempControl = document.getElementById(
        "ac-side-temperature-control"
      );
      if (tempControl)
        tempControl.style.display = currentStatus === "ON" ? "block" : "none";
    }
  }
}

function hideManualModal() {
  const modal = document.getElementById("manual-modal");
  if (modal) modal.style.display = "none";
}

// ==========================================================
// FUNGSI UTAMA: APPLY CHANGES (Kirim ke Backend)
// ==========================================================
async function applyManualChanges() {
  console.log("✅ Apply changes clicked");

  // 1. UPDATE TAMPILAN DASHBOARD (Agar responsif)
  const acFrontElement = document.getElementById("ac-front");
  if (acFrontElement) {
    const statusEl = acFrontElement.querySelector(".ac-status");
    const tempEl = acFrontElement.querySelector(".ac-temperature");

    if (acFrontSwitch.checked) {
      statusEl.textContent = "ON";
      statusEl.className = "ac-status status-on";
      tempEl.textContent = acFrontTemperature.value + " °C";
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
      tempEl.textContent = acSideTemperature.value + " °C";
    } else {
      statusEl.textContent = "OFF";
      statusEl.className = "ac-status status-off";
      tempEl.textContent = "- °C";
    }
  }

  updateRoomStatus();
  hideManualModal();

  // 2. KIRIM PERINTAH KE BACKEND
  const payloadFront = {
    location: "front",
    action: acFrontSwitch.checked ? "ON" : "OFF",
    temperature: parseInt(acFrontTemperature.value),
  };

  const payloadSide = {
    location: "side",
    action: acSideSwitch.checked ? "ON" : "OFF",
    temperature: parseInt(acSideTemperature.value),
  };

  try {
    console.log("📡 Sending commands to backend...");

    await sendACCommand(payloadFront);
    await sendACCommand(payloadSide);

    console.log("✅ All commands sent successfully");
  } catch (error) {
    console.error("❌ Failed to send AC control:", error);
    alert("Gagal menghubungi server! Pastikan backend berjalan di port 5000.");
  }
}

// Helper: Fetch API
async function sendACCommand(data) {
  // Pastikan URL ini benar
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
