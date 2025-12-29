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
import { setSystemMode } from "./mode-control.js";
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

  // Set default occupancy
  setDefaultOccupancy();

  // Setup event listeners
  setupModeButtons();
  setupModal();
  initBoundingBox(); // Inisialisasi bounding box system

  // Fetch data dari backend pertama kali
  fetchDataFromBackend();
  fetchOccupancyFromBackend();

  // Update refresh time every 10 seconds
  setInterval(updateRefreshTime, 10000);

  // Fetch data dari backend setiap 10 detik
  setInterval(fetchDataFromBackend, 10000);
  setInterval(fetchOccupancyFromBackend, 10000);

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

  console.log("🔍 Looking for mode buttons...");
  console.log("Manual button:", manualBtn);
  console.log("Auto button:", autoBtn);

  if (!manualBtn) {
    console.error("❌ manual-mode-btn NOT FOUND!");
    return;
  }

  if (!autoBtn) {
    console.error("❌ auto-mode-btn NOT FOUND!");
    return;
  }

  // Open modal when Manual Mode is clicked
  manualBtn.addEventListener("click", async function () {
    console.log("📱 Manual mode button clicked");

    // Update button states
    manualBtn.classList.add("btn-active");
    manualBtn.classList.remove("btn-outline");
    autoBtn.classList.add("btn-outline");
    autoBtn.classList.remove("btn-primary", "btn-active");

    // Update button text
    manualBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Manual Mode';
    autoBtn.innerHTML = '<i class="fas fa-robot"></i> Automatic Mode';

    // Update mode indicator
    if (modeIndicator) {
      modeIndicator.className = "mode-indicator manual";
      modeIndicator.innerHTML = '<i class="fas fa-hand-paper"></i> Manual Mode';
    }

    // Show modal
    showManualModal();

    // Send mode to backend
    try {
      await setSystemMode("manual");
      console.log("✅ Mode set to manual");
    } catch (error) {
      console.error("Failed to set manual mode:", error);
      alert("Failed to switch to Manual Mode. Please try again.");
    }
  });

  // Return to automatic mode when Automatic Mode button is clicked
  autoBtn.addEventListener("click", async function () {
    console.log("🤖 Auto mode button clicked");

    autoBtn.classList.add("btn-primary", "btn-active");
    autoBtn.classList.remove("btn-outline");
    manualBtn.classList.add("btn-outline");
    manualBtn.classList.remove("btn-active");

    // Update button text
    manualBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Manual Mode';
    autoBtn.innerHTML = '<i class="fas fa-robot"></i> Automatic Mode';

    // Update mode indicator
    if (modeIndicator) {
      modeIndicator.className = "mode-indicator auto";
      modeIndicator.innerHTML = '<i class="fas fa-robot"></i> Auto Mode';
    }

    // If modal is open, close it
    hideManualModal();

    // Send mode to backend
    try {
      await setSystemMode("auto");
      console.log("✅ Mode set to auto");
    } catch (error) {
      console.error("Failed to set auto mode:", error);
      alert("Failed to switch to Auto Mode. Please try again.");
    }
  });

  console.log("✅ Mode buttons setup complete!");
}

// Fungsi untuk setup modal manual control
function setupModal() {
  modal = document.getElementById("manual-modal");
  closeBtn = document.querySelector(".close");
  cancelBtn = document.getElementById("cancel-changes");
  applyBtn = document.getElementById("apply-changes");

  // AC Front controls
  acFrontSwitch = document.getElementById("ac-front-switch");
  acFrontStatus = document.getElementById("ac-front-status");
  acFrontTemperature = document.getElementById("ac-front-temperature");
  acFrontTemperatureValue = document.getElementById(
    "ac-front-temperature-value"
  );

  // AC Side controls
  acSideSwitch = document.getElementById("ac-side-switch");
  acSideStatus = document.getElementById("ac-side-status");
  acSideTemperature = document.getElementById("ac-side-temperature");
  acSideTemperatureValue = document.getElementById("ac-side-temperature-value");

  console.log("🔍 Modal elements check:", {
    modal: !!modal,
    closeBtn: !!closeBtn,
    cancelBtn: !!cancelBtn,
    applyBtn: !!applyBtn,
    acFrontSwitch: !!acFrontSwitch,
  });

  // Close modal when X is clicked
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      hideManualModal();
    });
  }

  // Close modal when Cancel is clicked
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      hideManualModal();
    });
  }

  // Apply changes when Apply is clicked
  if (applyBtn) {
    console.log("✅ Apply button found, adding click listener");
    applyBtn.addEventListener("click", function () {
      console.log("✅ Apply changes button clicked!");
      applyManualChanges();
    });
  }

  // Close modal when clicking outside
  if (modal) {
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        hideManualModal();
      }
    });
  }

  // Setup View Snapshot button
  const viewSnapshotBtn = document.getElementById("view-snapshot-btn");
  if (viewSnapshotBtn) {
    viewSnapshotBtn.addEventListener("click", function () {
      console.log("📸 View Snapshot button clicked");
      showSnapshotModal();
    });
  }

  // Close snapshot modal when X is clicked
  const closeSnapshotBtn = document.querySelector(".close-snapshot");
  if (closeSnapshotBtn) {
    closeSnapshotBtn.addEventListener("click", function () {
      hideSnapshotModal();
    });
  }

  // Update status text when AC Front switch is toggled
  if (acFrontSwitch && acFrontStatus) {
    acFrontSwitch.addEventListener("change", function () {
      const status = acFrontSwitch.checked ? "ON" : "OFF";
      acFrontStatus.textContent = status;

      // Show/hide temperature control
      const tempControl = document.getElementById(
        "ac-front-temperature-control"
      );
      if (tempControl) {
        tempControl.style.display = acFrontSwitch.checked ? "block" : "none";
      }
    });
  }

  // Update status text when AC Side switch is toggled
  if (acSideSwitch && acSideStatus) {
    acSideSwitch.addEventListener("change", function () {
      const status = acSideSwitch.checked ? "ON" : "OFF";
      acSideStatus.textContent = status;

      // Show/hide temperature control
      const tempControl = document.getElementById(
        "ac-side-temperature-control"
      );
      if (tempControl) {
        tempControl.style.display = acSideSwitch.checked ? "block" : "none";
      }
    });
  }

  // Update temperature value when AC Front slider is moved
  if (acFrontTemperature && acFrontTemperatureValue) {
    acFrontTemperature.addEventListener("input", function () {
      acFrontTemperatureValue.textContent = acFrontTemperature.value;
    });
  }

  // Update temperature value when AC Side slider is moved
  if (acSideTemperature && acSideTemperatureValue) {
    acSideTemperature.addEventListener("input", function () {
      acSideTemperatureValue.textContent = acSideTemperature.value;
    });
  }

  console.log("✅ Modal setup complete!");
}

// Fungsi untuk menampilkan modal manual
function showManualModal() {
  console.log("📱 Showing manual modal");
  const modal = document.getElementById("manual-modal");
  if (modal) {
    modal.style.display = "block";

    // Initialize switch states based on current AC status
    const acFrontElement = document.getElementById("ac-front");
    const acSideElement = document.getElementById("ac-side");

    // AC Front
    if (
      acFrontElement &&
      acFrontSwitch &&
      acFrontStatus &&
      acFrontTemperature &&
      acFrontTemperatureValue
    ) {
      const currentACFrontStatus =
        acFrontElement.querySelector(".ac-status").textContent;
      const currentACFrontTemperature =
        acFrontElement.querySelector(".ac-temperature").textContent;

      acFrontSwitch.checked = currentACFrontStatus === "ON";
      acFrontStatus.textContent = currentACFrontStatus;

      if (currentACFrontTemperature === "- °C") {
        acFrontTemperature.value = 17;
        acFrontTemperatureValue.textContent = 17;
      } else {
        const tempValue = currentACFrontTemperature.replace(" °C", "");
        acFrontTemperature.value = tempValue;
        acFrontTemperatureValue.textContent = tempValue;
      }

      // Show/hide temperature control
      const frontTempControl = document.getElementById(
        "ac-front-temperature-control"
      );
      if (frontTempControl) {
        frontTempControl.style.display = acFrontSwitch.checked
          ? "block"
          : "none";
      }
    }

    // AC Side
    if (
      acSideElement &&
      acSideSwitch &&
      acSideStatus &&
      acSideTemperature &&
      acSideTemperatureValue
    ) {
      const currentACSideStatus =
        acSideElement.querySelector(".ac-status").textContent;
      const currentACSideTemperature =
        acSideElement.querySelector(".ac-temperature").textContent;

      acSideSwitch.checked = currentACSideStatus === "ON";
      acSideStatus.textContent = currentACSideStatus;

      if (currentACSideTemperature === "- °C") {
        acSideTemperature.value = 17;
        acSideTemperatureValue.textContent = 17;
      } else {
        const tempValue = currentACSideTemperature.replace(" °C", "");
        acSideTemperature.value = tempValue;
        acSideTemperatureValue.textContent = tempValue;
      }

      // Show/hide temperature control
      const sideTempControl = document.getElementById(
        "ac-side-temperature-control"
      );
      if (sideTempControl) {
        sideTempControl.style.display = acSideSwitch.checked ? "block" : "none";
      }
    }
  } else {
    console.error("❌ Manual modal not found!");
  }
}

// Fungsi untuk menyembunyikan modal
function hideManualModal() {
  console.log("📱 Hiding manual modal");
  const modal = document.getElementById("manual-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Fungsi untuk apply manual changes
function applyManualChanges() {
  console.log("✅ Apply changes clicked");

  // Update AC Front status in the main view
  const acFrontElement = document.getElementById("ac-front");
  if (acFrontElement) {
    const temperature = acFrontElement.querySelector(".ac-temperature");
    const status = acFrontElement.querySelector(".ac-status");

    if (acFrontSwitch && acFrontSwitch.checked) {
      if (temperature) {
        temperature.textContent = acFrontTemperature.value + " °C";
      }
      if (status) {
        status.textContent = "ON";
        status.className = "ac-status status-on";
      }
    } else {
      if (temperature) temperature.textContent = "- °C";
      if (status) {
        status.textContent = "OFF";
        status.className = "ac-status status-off";
      }
    }
  }

  // Update AC Side status in the main view
  const acSideElement = document.getElementById("ac-side");
  if (acSideElement) {
    const temperature = acSideElement.querySelector(".ac-temperature");
    const status = acSideElement.querySelector(".ac-status");

    if (acSideSwitch && acSideSwitch.checked) {
      if (temperature) {
        temperature.textContent = acSideTemperature.value + " °C";
      }
      if (status) {
        status.textContent = "ON";
        status.className = "ac-status status-on";
      }
    } else {
      if (temperature) temperature.textContent = "- °C";
      if (status) {
        status.textContent = "OFF";
        status.className = "ac-status status-off";
      }
    }
  }

  // Update room status
  updateRoomStatus();

  // Close modal
  hideManualModal();

  // Send AC control to backend (tambahkan nanti)
  try {
    // Simpan dulu untuk testing
    console.log("AC Front:", {
      status: acFrontSwitch.checked,
      temperature: acFrontTemperature.value,
    });
    console.log("AC Side:", {
      status: acSideSwitch.checked,
      temperature: acSideTemperature.value,
    });

    alert("Manual changes applied successfully! (Testing mode)");
  } catch (error) {
    console.error("Failed to apply AC control:", error);
    alert("Failed to apply changes. Please try again.");
  }
}

// Cleanup ketika halaman ditutup
window.addEventListener("beforeunload", function () {
  cleanupBoundingBox();
});

// Export fungsi untuk penggunaan global jika diperlukan
window.showManualModal = showManualModal;
window.hideManualModal = hideManualModal;
window.applyManualChanges = applyManualChanges;
window.showSnapshotModal = showSnapshotModal;
window.hideSnapshotModal = hideSnapshotModal;
