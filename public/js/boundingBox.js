// =======================================================
// boundingBox.js
// Mengelola Snapshot Bounding Box YOLO (Occupancy)
// =======================================================

// Interval refresh snapshot (5 menit)
const SNAPSHOT_UPDATE_INTERVAL = 5 * 60 * 1000;
let snapshotInterval = null;

// URL snapshot bounding box (static file dari backend)
const SNAPSHOT_URL =
  "https://microlabmonitoring.cloud/images/snapshot/occupancy.jpg";

// =======================================================
// INITIALIZATION
// =======================================================
export function initBoundingBox() {
  console.log("📸 Bounding Box Snapshot initialized");
  setupSnapshotButtons();
}

// =======================================================
// SETUP BUTTON EVENTS
// =======================================================
function setupSnapshotButtons() {
  const viewBtn = document.getElementById("view-snapshot-btn");
  const closeBtn = document.getElementById("close-snapshot-btn");

  if (viewBtn) viewBtn.addEventListener("click", showSnapshotModal);
  if (closeBtn) closeBtn.addEventListener("click", hideSnapshotModal);
}

// =======================================================
// SHOW SNAPSHOT MODAL
// =======================================================
export function showSnapshotModal() {
  const modal = document.getElementById("snapshot-modal");
  if (!modal) return;

  // Sinkronisasi data saat modal dibuka
  updateSnapshotCount();
  refreshSnapshot();
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
}

// =======================================================
// REFRESH SNAPSHOT IMAGE
// =======================================================
async function refreshSnapshot() {
  console.log("🔄 Refreshing YOLO snapshot...");
  showLoadingState();

  try {
    // Cache busting agar selalu ambil gambar terbaru
    const imageUrl = `${SNAPSHOT_URL}?t=${Date.now()}`;
    displaySnapshotImage(imageUrl);

    updateSnapshotTimestamp();
    updateSnapshotCount();

    console.log("✅ Snapshot updated");
  } catch (error) {
    console.error("❌ Failed to load snapshot:", error);
    showErrorState("Failed to load snapshot image");
  }
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
// SYNC OCCUPANCY COUNT (FROM DASHBOARD)
// =======================================================
function updateSnapshotCount() {
  const snapshotCount = document.getElementById("snapshot-count");
  const occupancyCount = document.getElementById("occupancy-count");

  if (!snapshotCount || !occupancyCount) return;

  const value = occupancyCount.textContent;
  snapshotCount.textContent = value;

  const numericValue = parseInt(value);
  if (!isNaN(numericValue) && numericValue > 0) {
    snapshotCount.style.color = "var(--success)";
    snapshotCount.style.fontWeight = "bold";
  } else {
    snapshotCount.style.color = "var(--accent-dark)";
    snapshotCount.style.fontWeight = "normal";
  }
}

// =======================================================
// UPDATE TIMESTAMP
// =======================================================
function updateSnapshotTimestamp() {
  const timestampEl = document.getElementById("snapshot-timestamp");
  if (!timestampEl) return;

  const now = new Date();
  timestampEl.textContent = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// =======================================================
// UI STATE: LOADING
// =======================================================
function showLoadingState() {
  const placeholder = document.querySelector(".snapshot-placeholder");
  const image = document.getElementById("snapshot-image");

  if (image) image.style.display = "none";

  if (placeholder) {
    placeholder.innerHTML = `
      <i class="fas fa-circle-notch fa-spin fa-3x"></i>
      <p>Loading snapshot...</p>
    `;
    placeholder.style.display = "flex";
  }
}

// =======================================================
// UI STATE: ERROR
// =======================================================
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
// INTERVAL MANAGEMENT
// =======================================================
function startSnapshotInterval() {
  stopSnapshotInterval();
  snapshotInterval = setInterval(refreshSnapshot, SNAPSHOT_UPDATE_INTERVAL);
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
