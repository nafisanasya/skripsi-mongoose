import { API_BASE, DEBUG } from "./config.js";

// Global State AC Status
let currentACStatus = {
  front: "OFF",
  side: "OFF",
};

// Fetch AC Status dari Backend
async function fetchACStatusFromBackend() {
  try {
    if (DEBUG) console.log("🔄 Fetching AC Status data from backend...");

    const response = await fetch(`${API_BASE}/ac-status`);

    if (!response.ok) {
      throw new Error(`AC Status HTTP error! status: ${response.status}`);
    }

    const acData = await response.json();

    if (DEBUG) {
      console.log("✅ AC Status data received:", acData);
    }

    updateACStatusUI(acData);
    return acData;
  } catch (error) {
    console.error("❌ Error fetching AC Status data:", error);
    setDefaultACStatus();
  }
}

// Update UI AC Status
function updateACStatusUI(data) {
  if (DEBUG) console.log("⚡ Data received in updateACStatusUI:", data);

  const frontElement = document.querySelector("#ac-front .ac-status");
  const sideElement = document.querySelector("#ac-side .ac-status");

  const frontModalLabel = document.getElementById("ac-front-status");
  const sideModalLabel = document.getElementById("ac-side-status");
  const frontSwitch = document.getElementById("ac-front-switch");
  const sideSwitch = document.getElementById("ac-side-switch");

  if (!frontElement || !sideElement) {
    console.warn("⚠️ AC UI elements not found inside #ac-front or #ac-side");
    return;
  }

  // Ambil data (Default OFF jika data kosong)
  const statusFront = data.front || "OFF";
  const statusSide = data.side || "OFF";

  // Update Tampilan Dashboard Utama
  updateSingleIndicator(frontElement, statusFront);
  updateSingleIndicator(sideElement, statusSide);

  // Update Tampilan di Modal Manual (Agar sinkron real-time)
  if (frontModalLabel && frontSwitch) {
    frontModalLabel.textContent = statusFront;
    frontSwitch.checked = statusFront === "ON";
  }

  if (sideModalLabel && sideSwitch) {
    sideModalLabel.textContent = statusSide;
    sideSwitch.checked = statusSide === "ON";
  }

  // Update Global State
  currentACStatus = {
    front: statusFront,
    side: statusSide,
  };
}

// Mengubah Teks & Class Warna (status-on / status-off)
function updateSingleIndicator(element, status) {
  element.textContent = status;

  // Hapus class lama
  element.classList.remove("status-on", "status-off");

  // Tambah class baru sesuai style.css
  if (status === "ON") {
    element.classList.add("status-on"); // Hijau
  } else {
    element.classList.add("status-off"); // Merah
  }

  // Efek Animasi Kedip Halus (Opacity)
  element.style.opacity = "0.5";
  setTimeout(() => {
    element.style.opacity = "1";
  }, 150);
}

// Default jika error (Set ke Strip dan Merah)
function setDefaultACStatus() {
  const frontElement = document.querySelector("#ac-front .ac-status");
  const sideElement = document.querySelector("#ac-side .ac-status");

  if (frontElement) {
    frontElement.textContent = "-";
    frontElement.classList.remove("status-on");
    frontElement.classList.add("status-off");
  }

  if (sideElement) {
    sideElement.textContent = "-";
    sideElement.classList.remove("status-on");
    sideElement.classList.add("status-off");
  }

  currentACStatus = { front: "OFF", side: "OFF" };
}

export {
  fetchACStatusFromBackend,
  updateACStatusUI,
  setDefaultACStatus,
  currentACStatus,
};
