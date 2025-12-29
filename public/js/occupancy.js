import { API_BASE, DEBUG } from "./config.js";
import {
  setDefaultData,
  updateRoomStatus,
  updateRefreshTime,
} from "./utils.js";
// =============================
// Fetch Occupancy dari Backend
// =============================
async function fetchOccupancyFromBackend() {
  try {
    if (DEBUG) console.log("🔄 Fetching occupancy data from backend...");

    const response = await fetch(`${API_BASE}/occupancy/latest`);

    if (!response.ok) {
      throw new Error(`Occupancy HTTP error! status: ${response.status}`);
    }

    const occupancyData = await response.json();

    if (DEBUG) {
      console.log("✅ Occupancy data received:", occupancyData);
    }

    updateOccupancyUI(occupancyData);
    return occupancyData; // Return data untuk digunakan di tempat lain
  } catch (error) {
    console.error("❌ Error fetching occupancy data:", error);
    setDefaultOccupancy();
    throw error; // Re-throw error untuk ditangani di main.js
  }
}

// =============================
// Update UI Occupancy
// =============================
function updateOccupancyUI(data) {
  if (DEBUG) console.log("📊 Data received in updateOccupancyUI:", data);

  const occupancyElement = document.getElementById("occupancy-count");

  if (!occupancyElement) {
    console.warn("⚠️ occupancy-count element not found");
    return;
  }

  // Handle different API response structures
  let peopleCount = "-";

  if (data && data.data && data.data.people_count !== undefined) {
    // Structure: { data: { people_count: 5 } }
    peopleCount = data.data.people_count;
  } else if (data && data.people_count !== undefined) {
    // Structure: { people_count: 5 }
    peopleCount = data.people_count;
  } else if (data && data.data && data.data.occupancy !== undefined) {
    // Structure: { data: { occupancy: 5 } }
    peopleCount = data.data.occupancy;
  }

  occupancyElement.textContent = peopleCount;

  // animasi update (biar konsisten dengan DHT22)
  occupancyElement.classList.add("updated");
  setTimeout(() => occupancyElement.classList.remove("updated"), 500);
}

// =============================
// Default jika error
// =============================
function setDefaultOccupancy() {
  const occupancyElement = document.getElementById("occupancy-count");
  if (occupancyElement) {
    occupancyElement.textContent = "-";
  }
}

// =============================
// Export fungsi
// =============================
export { fetchOccupancyFromBackend, updateOccupancyUI, setDefaultOccupancy };
