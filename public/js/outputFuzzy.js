import { API_BASE, DEBUG } from "./config.js";
// Kita import fungsi utilitas yang sama (opsional: buat fungsi reset khusus jika perlu)
import { updateRefreshTime } from "./utils.js";

// Fungsi untuk update data fuzzy dari backend
async function fetchFuzzyFromBackend() {
  try {
    if (DEBUG) console.log("🔄 Starting to fetch fuzzy data from backend...");

    // Ambil data dari API untuk front dan side secara parallel
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

    // Update UI dengan data dari backend
    updateUIWithFuzzyData({
      frontData: frontData,
      sideData: sideData,
    });
  } catch (error) {
    console.error("❌ Error fetching fuzzy data:", error);
    // Opsional: Set tampilan ke "-" jika error
    resetFuzzyDisplay();
  }
}

// Fungsi untuk update UI dengan data dari backend
function updateUIWithFuzzyData(data) {
  if (DEBUG) console.log("📊 Fuzzy Data received in updateUI:", data);

  // Update AC Front Output
  if (data.frontData && data.frontData.data) {
    // Pastikan ID elemen di HTML sesuai (misal: ac-front)
    const acFront = document.getElementById("ac-front");
    if (acFront) {
      // Pastikan ada class khusus untuk menampung nilai fuzzy (misal: .fuzzy-temp)
      const fuzzyTemp = acFront.querySelector(".fuzzy-temp");

      if (fuzzyTemp) {
        fuzzyTemp.textContent = data.frontData.data.temperature + " °C";
      }

      // Add update animation (efek kedip)
      acFront.classList.add("updated");
      setTimeout(() => acFront.classList.remove("updated"), 500);
    }
  }

  // Update AC Side Output
  if (data.sideData && data.sideData.data) {
    const acSide = document.getElementById("ac-side");
    if (acSide) {
      const fuzzyTemp = acSide.querySelector(".fuzzy-temp");

      if (fuzzyTemp) {
        fuzzyTemp.textContent = data.sideData.data.temperature + " °C";
      }

      acSide.classList.add("updated");
      setTimeout(() => acSide.classList.remove("updated"), 500);
    }
  }

  // Update waktu refresh terakhir
  updateRefreshTime();
}

// Fungsi helper kecil untuk reset tampilan jika error (local helper)
function resetFuzzyDisplay() {
  const elements = document.querySelectorAll(".fuzzy-temp");
  elements.forEach((el) => (el.textContent = "- °C"));
}

export { fetchFuzzyFromBackend, updateUIWithFuzzyData };
