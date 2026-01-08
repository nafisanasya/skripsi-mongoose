import { API_BASE, DEBUG } from "./config.js";

// =======================================================
// CONFIG
// =======================================================
const SNAPSHOT_UPDATE_INTERVAL = 5 * 60 * 1000;
const SNAPSHOT_POLL_INTERVAL = 1000; // 🔹 polling tiap 1 detik
let snapshotInterval = null;
let pollingInterval = null;

const SNAPSHOT_BASE_URL = "https://microlabmonitoring.cloud/images/snapshot";

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
  if (refreshBtn) refreshBtn.addEventListener("click", refreshSnapshotManual);
}

// =======================================================
// SHOW SNAPSHOT MODAL
// =======================================================
export function showSnapshotModal() {
  const modal = document.getElementById("snapshot-modal");
  if (!modal) return;

  loadSnapshotImage();
  startSnapshotInterval();

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
  stopPollingSnapshot();
}

// =======================================================
// MANUAL SNAPSHOT REFRESH (BUFFERING SAMPAI SELESAI)
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

    await response.json();

    // 🔁 mulai polling status snapshot
    startPollingSnapshot();
  } catch (err) {
    console.error("❌ Snapshot refresh error:", err);
    showErrorState("Failed to refresh snapshot");
  }
}

// =======================================================
// POLLING SNAPSHOT STATUS (INTI SOLUSI)
// =======================================================
function startPollingSnapshot() {
  stopPollingSnapshot();

  pollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE}/snapshot/latest`);
      if (!res.ok) return;

      const data = await res.json();

      // ⏳ masih diproses → tetap buffering
      if (data.processing === true) {
        if (DEBUG) console.log("⏳ Snapshot masih diproses...");
        return;
      }

      // ✅ sudah selesai → tampilkan
      stopPollingSnapshot();
      displaySnapshotResult(data);
    } catch (err) {
      console.error("❌ Polling snapshot error:", err);
    }
  }, SNAPSHOT_POLL_INTERVAL);
}

function stopPollingSnapshot() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// =======================================================
// LOAD SNAPSHOT IMAGE (NORMAL / AUTO)
// =======================================================
async function loadSnapshotImage() {
  try {
    const res = await fetch(`${API_BASE}/snapshot/latest`);
    if (!res.ok) throw new Error("Failed to get latest snapshot");

    const data = await res.json();
    displaySnapshotResult(data);
  } catch (err) {
    console.error("❌ Load snapshot error:", err);
    showErrorState("Snapshot image not available");
  }
}

// =======================================================
// DISPLAY SNAPSHOT RESULT (GAMBAR + ANGKA)
// =======================================================
function displaySnapshotResult(data) {
  const imageUrl = `${SNAPSHOT_BASE_URL}/${data.snapshot_file}?t=${Date.now()}`;
  displaySnapshotImage(imageUrl);
  updateSnapshotTimestamp();
  updateSnapshotCountFromAPI(data.people_count);
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
// UPDATE OCCUPANCY COUNT
// =======================================================
function updateSnapshotCountFromAPI(value) {
  const snapshotCount = document.getElementById("snapshot-count");
  if (!snapshotCount) return;

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
// INTERVAL (AUTO REFRESH)
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
  stopPollingSnapshot();
}
