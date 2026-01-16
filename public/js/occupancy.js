import { API_BASE, DEBUG } from "./config.js";
import { updateRoomStatus } from "./utils.js";

// Global State Occupancy
let currentOccupancy = 0;

// Fetch Occupancy dari Beckend
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
    return occupancyData;
  } catch (error) {
    console.error("❌ Error fetching occupancy data:", error);
    setDefaultOccupancy();
  }
}

//Update UI Occupancy
function updateOccupancyUI(data) {
  if (DEBUG) console.log("📊 Data received in updateOccupancyUI:", data);

  const occupancyElement = document.getElementById("occupancy-count");
  if (!occupancyElement) {
    console.warn("⚠️ occupancy-count element not found");
    return;
  }

  let peopleCount = 0;

  if (data?.data?.people_count !== undefined) {
    peopleCount = data.data.people_count;
  } else if (data?.people_count !== undefined) {
    peopleCount = data.people_count;
  }

  // Update UI
  occupancyElement.textContent = peopleCount;

  // Update GLOBAL STATE
  currentOccupancy = Number(peopleCount) || 0;

  // Animasi
  occupancyElement.classList.add("updated");
  setTimeout(() => occupancyElement.classList.remove("updated"), 500);

  // Update room status
  updateRoomStatus();
}

// Default jika error
function setDefaultOccupancy() {
  const occupancyElement = document.getElementById("occupancy-count");
  if (occupancyElement) {
    occupancyElement.textContent = "-";
  }
  currentOccupancy = 0;
  updateRoomStatus();
}

//Export
export {
  fetchOccupancyFromBackend,
  updateOccupancyUI,
  setDefaultOccupancy,
  currentOccupancy,
};