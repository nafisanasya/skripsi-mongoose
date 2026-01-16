import { API_BASE, DEBUG } from "./config.js";
import { updateRefreshTime } from "./utils.js";
import { isManualMode } from "./state.js";

// Fungsi untuk update data fuzzy dari backend
async function fetchFuzzyFromBackend() {
  try {
    if (DEBUG) console.log("🔄 Starting to fetch fuzzy data from backend...");

    const [frontResponse, sideResponse] = await Promise.all([
      fetch(`${API_BASE}/fuzzy/front/latest`),
      fetch(`${API_BASE}/fuzzy/side/latest`),
    ]);

    if (!frontResponse.ok) {
      throw new Error(
        `Front Fuzzy HTTP error! status: ${frontResponse.status}`
      );
    }
    if (!sideResponse.ok) {
      throw new Error(`Side Fuzzy HTTP error! status: ${sideResponse.status}`);
    }

    const frontData = await frontResponse.json();
    const sideData = await sideResponse.json();

    if (DEBUG) {
      console.log("✅ Front Fuzzy received:", frontData);
      console.log("✅ Side Fuzzy received:", sideData);
    }

    updateUIWithFuzzyData({
      frontData: frontData,
      sideData: sideData,
    });
  } catch (error) {
    console.error("❌ Error fetching fuzzy data:", error);
    resetFuzzyDisplay();
  }
}

// Fungsi untuk update UI dengan data dari backend
function updateUIWithFuzzyData(data) {
  if (DEBUG) console.log("📊 Fuzzy Data received in updateUI:", data);

  // JANGAN update UI jika mode manual
  if (isManualMode()) {
    if (DEBUG) console.log("⏸️ Manual mode: Skipping fuzzy UI update");
    return;
  }

  // Update AC Front Output
  if (data.frontData && data.frontData.data) {
    const acFront = document.getElementById("ac-front");
    if (acFront) {
      // PERBAIKAN: Ubah .fuzzy-temp menjadi .ac-temperature (sesuai HTML)
      const fuzzyTemp = acFront.querySelector(".ac-temperature");

      if (fuzzyTemp) {
        fuzzyTemp.textContent = data.frontData.data.temperature + " °C";
      }

      acFront.classList.add("updated");
      setTimeout(() => acFront.classList.remove("updated"), 500);
    }
  }

  // Update AC Side Output
  if (data.sideData && data.sideData.data) {
    const acSide = document.getElementById("ac-side");
    if (acSide) {
      // PERBAIKAN: Ubah .fuzzy-temp menjadi .ac-temperature (sesuai HTML)
      const fuzzyTemp = acSide.querySelector(".ac-temperature");

      if (fuzzyTemp) {
        fuzzyTemp.textContent = data.sideData.data.temperature + " °C";
      }

      acSide.classList.add("updated");
      setTimeout(() => acSide.classList.remove("updated"), 500);
    }
  }

  updateRefreshTime();
}

// Fungsi helper kecil untuk reset tampilan jika error (local helper)
function resetFuzzyDisplay() {
  // PERBAIKAN: Ubah selector menjadi .ac-temperature
  const elements = document.querySelectorAll(".ac-temperature");
  elements.forEach((el) => (el.textContent = "- °C"));
}

export { fetchFuzzyFromBackend, updateUIWithFuzzyData };
