import { DEBUG } from "./config.js";
import { currentOccupancy } from "./occupancy.js";

//Update Waktu Refresh
function updateRefreshTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const element = document.getElementById("update-time");
  if (element) element.textContent = timeString;
}

// Update Tanggal
function updateCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const dateString = now.toLocaleDateString("en-US", options);
  const element = document.getElementById("current-date");
  if (element) element.textContent = dateString;
}

// Set Default Data
function setDefaultData() {
  if (DEBUG) console.log("🔄 Setting default data...");

  // Temperature
  document.querySelectorAll(".temperature").forEach((el) => {
    el.textContent = "- °C";
  });

  // Humidity
  document.querySelectorAll(".humidity").forEach((el) => {
    el.textContent = "Humidity: -";
  });

  // Occupancy
  const occupancyElement = document.getElementById("occupancy-count");
  if (occupancyElement) occupancyElement.textContent = "-";

  // AC
  document.querySelectorAll(".ac-temperature").forEach((el) => {
    el.textContent = "- °C";
  });

  document.querySelectorAll(".ac-status").forEach((el) => {
    el.textContent = "OFF";
    el.className = "ac-status status-off";
  });

  updateRoomStatus();
}

// Update Status Ruangan
function updateRoomStatus() {
  const roomStatusIndicator = document.querySelector(".room-status-indicator");

  if (!roomStatusIndicator) {
    if (DEBUG) console.error("❌ Room status indicator not found!");
    return;
  }

  const statusIcon = roomStatusIndicator.querySelector(".status-icon i");
  const statusText = roomStatusIndicator.querySelector("h4");
  const statusDetail = roomStatusIndicator.querySelector("p");

  // Jika Ada Orang = Room Used
  if (currentOccupancy > 0) {
    roomStatusIndicator.className = "room-status-indicator status-used";
    statusIcon.className = "fas fa-door-open";
    statusText.textContent = "Room Used";
    statusDetail.textContent = `Occupancy: ${currentOccupancy} person(s)`;

    if (DEBUG)
      console.log("🟢 Room Used (Occupancy detected):", currentOccupancy);
    return;
  }

  /* =========================
     PRIORITAS 2: STATUS AC
  ========================= */
  let anyAcOn = false;
  document.querySelectorAll(".ac-status").forEach((status) => {
    if (status.textContent === "ON") {
      anyAcOn = true;
    }
  });

  if (anyAcOn) {
    roomStatusIndicator.className = "room-status-indicator status-used";
    statusIcon.className = "fas fa-door-open";
    statusText.textContent = "Room Used";
    statusDetail.textContent = "AC is ON";

    if (DEBUG) console.log("🟢 Room Used (AC ON)");
  } else {
    roomStatusIndicator.className = "room-status-indicator status-unused";
    statusIcon.className = "fas fa-door-closed";
    statusText.textContent = "Room Not Used";
    statusDetail.textContent = "AC is OFF";

    if (DEBUG) console.log("🔴 Room Not Used");
  }
}

// Export
export {
  updateRefreshTime,
  updateCurrentDate,
  setDefaultData,
  updateRoomStatus,
};
