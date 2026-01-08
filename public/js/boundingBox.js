import { API_BASE, DEBUG } from "./config.js";

// =======================================================
// CONFIG
// =======================================================
const SNAPSHOT_UPDATE_INTERVAL = 5 * 60 * 1000;
let snapshotInterval = null;

const SNAPSHOT_URL =
  "https://microlabmonitoring.cloud/images/snapshot/occupancy.jpg";

// =======================================================
// INITIALIZATION
// =======================================================
export function initBoundingBox() {
  if (DEBUG) console.log("📸 Bounding Box initialized");
  setupSnapshotButtons();
}

// =======================================================
// BUTTON EVENTS
// =======================================================
function setupSnapshotButtons() {
  const viewBtn = document.getElementById("view-snapshot-btn");
  const closeBtn = document.getElementById("close-snapshot-btn");
  const refreshBtn = document.getElementById("refresh-snapshot-btn");

  if (viewBtn) viewBtn.addEventListener("click", showSnapshotModal);
  if (closeBtn) closeBtn.addEventListener("click", hideSnapshotModal);

  // 🔹 REFRESH MANUAL (INI YANG TRIGGER BACKEND)
  if (refreshBtn) refreshBtn.addEventListener("click", refreshSnapshotManual);
}

// =======================================================
// SHOW SNAPSHOT MODAL (TANPA REFRESH BACKEND)
// =======================================================
export function showSnapshotModal() {
  const modal = document.getElementById("snapshot-modal");
  if (!modal) return;

  updateSnapshotCount();
  loadSnapshotImage(); // ⬅️ hanya load image
  startSnapshotInterval(); // ⬅️ auto reload image

  modal.style.display = "flex";
}

// =======================================================
// HIDE SNAPSHOT MODAL
// =======================================================
export function hideSnapshotModal() {
  const modal = document.getElementById("snapshot-modal");
  if (!modal) return;

  modal.style.display = "none";
  stopSnapshotInterval();
}

// =======================================================
// MANUAL SNAPSHOT REFRESH (TRIGGER BACKEND + MQTT)
// =======================================================
async function refreshSnapshotManual() {
  if (DEBUG) console.log("🔄 Manual snapshot refresh");

  showLoadingState();

  try {
    const response = await fetch(`${API_BASE}/snapshot/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Snapshot refresh failed");
    }

    // paksa browser menunggu backend
    await response.json();

    // setelah backend selesai → load image terbaru
    loadSnapshotImage();
  } catch (err) {
    console.error("❌ Snapshot refresh error:", err);
    showErrorState("Failed to refresh snapshot");
  }
}

// =======================================================
// LOAD SNAPSHOT IMAGE ONLY (NO BACKEND CALL)
// =======================================================
function loadSnapshotImage() {
  const imageUrl = `${SNAPSHOT_URL}?t=${Date.now()}`;
  displaySnapshotImage(imageUrl);
  updateSnapshotTimestamp();
}

// =======================================================
// DISPLAY SNAPSHOT IMAGE
// =======================================================
function displaySnapshotImage(imageUrl) {
  const image = document.getElementById("snapshot-image");
  const placeholder = document.querySelector(".snapshot-placeholder");

  if (!image || !placeholder) return;

  image.onload = () => {
    placeholder.style.display = "none";
    image.style.display = "block";
  };

  image.onerror = () => {
    showErrorState("Snapshot image not available");
  };

  image.src = imageUrl;
}

// =======================================================
// SYNC OCCUPANCY COUNT
// =======================================================
function updateSnapshotCount() {
  const snapshotCount = document.getElementById("snapshot-count");
  const occupancyCount = document.getElementById("occupancy-count");

  if (!snapshotCount || !occupancyCount) return;

  const value = occupancyCount.textContent;
  snapshotCount.textContent = value;

  const num = parseInt(value);
  if (!isNaN(num) && num > 0) {
    snapshotCount.style.color = "var(--success)";
    snapshotCount.style.fontWeight = "bold";
  } else {
    snapshotCount.style.color = "var(--accent-dark)";
    snapshotCount.style.fontWeight = "normal";
  }
}

// =======================================================
// TIMESTAMP
// =======================================================
function updateSnapshotTimestamp() {
  const el = document.getElementById("snapshot-timestamp");
  if (!el) return;

  el.textContent = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// =======================================================
// UI STATES
// =======================================================
function showLoadingState() {
  const placeholder = document.querySelector(".snapshot-placeholder");
  const image = document.getElementById("snapshot-image");

  if (image) image.style.display = "none";

  if (placeholder) {
    placeholder.innerHTML = `
      <i class="fas fa-circle-notch fa-spin fa-3x"></i>
      <p>Refreshing snapshot...</p>
    `;
    placeholder.style.display = "flex";
  }
}

function showErrorState(message) {
  const placeholder = document.querySelector(".snapshot-placeholder");
  if (!placeholder) return;

  placeholder.innerHTML = `
    <i class="fas fa-exclamation-triangle fa-3x" style="color: var(--danger)"></i>
    <p>${message}</p>
  `;
  placeholder.style.display = "flex";
}

// =======================================================
// INTERVAL (AUTO LOAD IMAGE ONLY)
// =======================================================
function startSnapshotInterval() {
  stopSnapshotInterval();
  snapshotInterval = setInterval(loadSnapshotImage, SNAPSHOT_UPDATE_INTERVAL);
}

function stopSnapshotInterval() {
  if (snapshotInterval) {
    clearInterval(snapshotInterval);
    snapshotInterval = null;
  }
}

// =======================================================
// CLEANUP
// =======================================================
export function cleanupBoundingBox() {
  stopSnapshotInterval();
}
