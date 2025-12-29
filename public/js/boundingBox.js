// boundingBox.js - Mengelola snapshot bounding box YOLO
let snapshotInterval = null;
const SNAPSHOT_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 menit

// Inisialisasi bounding box
export function initBoundingBox() {
  console.log("📸 Initializing bounding box snapshot system...");
  setupSnapshotControls();
}

// Setup event listeners tombol
function setupSnapshotControls() {
  const refreshBtn = document.getElementById("refresh-snapshot-btn");
  const closeBtn = document.getElementById("close-snapshot-btn");

  if (refreshBtn) refreshBtn.addEventListener("click", refreshSnapshot);
  if (closeBtn) closeBtn.addEventListener("click", hideSnapshotModal);
}

// Tampilkan modal snapshot
export function showSnapshotModal() {
  console.log("📸 Showing snapshot modal");
  const snapshotModal = document.getElementById("snapshot-modal");

  if (snapshotModal) {
    // 1. Update angka saat modal dibuka
    updateSnapshotCount();

    // 2. Load gambar snapshot
    refreshSnapshot();

    // 3. Mulai auto-refresh interval
    startSnapshotInterval();

    // 4. Tampilkan modal
    snapshotModal.style.display = "flex"; // Gunakan flex agar centering CSS bekerja
  }
}

// Sembunyikan modal
export function hideSnapshotModal() {
  const snapshotModal = document.getElementById("snapshot-modal");
  if (snapshotModal) {
    snapshotModal.style.display = "none";
    stopSnapshotInterval();
  }
}

// Logic refresh snapshot
async function refreshSnapshot() {
  console.log("🔄 Refreshing snapshot...");
  showLoadingState();

  try {
    // Simulasi fetch gambar (Ganti dengan endpoint asli Anda nanti)
    await fetchSnapshotFromBackend();

    // Update data pendukung
    updateSnapshotTimestamp();
    updateSnapshotCount(); // Pastikan angka di-update lagi setelah refresh

    console.log("✅ Snapshot refreshed");
  } catch (error) {
    console.error("❌ Failed to refresh snapshot:", error);
    showErrorState("Failed to load snapshot.");
  }
}

// Simulasi Backend Fetch (Untuk Demo)
async function fetchSnapshotFromBackend() {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Gambar dummy random untuk demo
      const demoImages = [
        "https://placehold.co/600x400/2b6cb0/ffffff?text=YOLO+Detection+1",
        "https://placehold.co/600x400/38a169/ffffff?text=YOLO+Detection+2",
      ];
      const randomImage =
        demoImages[Math.floor(Math.random() * demoImages.length)];

      displaySnapshotImage(randomImage);
      resolve();
    }, 1000);
  });
}

function displaySnapshotImage(imageUrl) {
  const snapshotImage = document.getElementById("snapshot-image");
  const placeholder = document.querySelector(".snapshot-placeholder");

  if (snapshotImage && placeholder) {
    placeholder.style.display = "none";
    snapshotImage.src = imageUrl;
    snapshotImage.style.display = "block";
  }
}

// ========================================================
// BAGIAN YANG DIPERBAIKI (AGAR NILAI SAMA DENGAN OCCUPANCY)
// ========================================================
function updateSnapshotCount() {
  const snapshotCount = document.getElementById("snapshot-count");
  const occupancyCount = document.getElementById("occupancy-count"); // Elemen di Dashboard Utama

  if (snapshotCount && occupancyCount) {
    // 1. Ambil teks nilai dari dashboard utama
    const realValue = occupancyCount.textContent;

    // 2. Masukkan nilai tersebut ke dalam modal snapshot
    snapshotCount.textContent = realValue;

    // 3. Styling (Hijau jika ada orang, Biru jika kosong/strip)
    const numericValue = parseInt(realValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      snapshotCount.style.color = "var(--success)";
      snapshotCount.style.fontWeight = "bold";
    } else {
      snapshotCount.style.color = "var(--accent-dark)";
    }
  }
}

// Update jam terakhir update
function updateSnapshotTimestamp() {
  const timestampElement = document.getElementById("snapshot-timestamp");
  if (timestampElement) {
    const now = new Date();
    timestampElement.textContent = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
}

// UI State: Loading
function showLoadingState() {
  const placeholder = document.querySelector(".snapshot-placeholder");
  const snapshotImage = document.getElementById("snapshot-image");

  if (placeholder) {
    // Icon loading circle notch (berputar) sesuai permintaan sebelumnya
    placeholder.innerHTML = `
        <i class="fas fa-circle-notch fa-spin fa-3x"></i>
        <p>Loading snapshot...</p>
    `;
    placeholder.style.display = "flex";
  }
  if (snapshotImage) snapshotImage.style.display = "none";
}

// UI State: Error
function showErrorState(message) {
  const placeholder = document.querySelector(".snapshot-placeholder");
  if (placeholder) {
    placeholder.innerHTML = `
        <i class="fas fa-exclamation-triangle fa-3x" style="color: var(--danger)"></i>
        <p>${message}</p>
    `;
    placeholder.style.display = "flex";
  }
}

// Interval Management
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

export function cleanupBoundingBox() {
  stopSnapshotInterval();
}
