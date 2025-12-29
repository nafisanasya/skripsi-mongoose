import { DEBUG } from "./config.js";

// Update waktu terakhir refresh
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

// Update tanggal
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

// Set semua data ke nilai default (-)
function setDefaultData() {
  if (DEBUG) console.log("🔄 Setting default data...");

  // Set sensor values to '-'
  const temperatureElements = document.querySelectorAll(".temperature");
  temperatureElements.forEach((temp) => {
    temp.textContent = "- °C";
  });

  // Set humidity to '-'
  const humidityElements = document.querySelectorAll(".humidity");
  humidityElements.forEach((humidity) => {
    humidity.textContent = "Humidity: -";
  });

  // Set occupancy to '-' - TAMBAHKAN BAGIAN INI
  const occupancyElement = document.getElementById("occupancy-count");
  if (occupancyElement) {
    occupancyElement.textContent = "-";
  }

  // Set AC status to 'OFF' and temperature to '-'
  const acTemperatureElements = document.querySelectorAll(".ac-temperature");
  const acStatusElements = document.querySelectorAll(".ac-status");

  acTemperatureElements.forEach((temp) => {
    temp.textContent = "- °C";
  });

  acStatusElements.forEach((status) => {
    status.textContent = "OFF";
    status.className = "ac-status status-off";
  });

  // Update room status
  updateRoomStatus();
}

// Update room status based on AC status
function updateRoomStatus() {
  const acStatusElements = document.querySelectorAll(".ac-status");
  const roomStatusIndicator = document.querySelector(".room-status-indicator");

  if (!roomStatusIndicator) {
    if (DEBUG) console.error("❌ Room status indicator not found!");
    return;
  }

  const statusIcon = roomStatusIndicator.querySelector(".status-icon i");
  const statusText = roomStatusIndicator.querySelector("h4");
  const statusDetail = roomStatusIndicator.querySelector("p");

  // Check if any AC is ON
  let anyAcOn = false;
  acStatusElements.forEach((status) => {
    if (status.textContent === "ON") {
      anyAcOn = true;
    }
  });

  // Update room status
  if (anyAcOn) {
    roomStatusIndicator.className = "room-status-indicator status-used";
    statusIcon.className = "fas fa-door-open";
    statusText.textContent = "Room Used";
    statusDetail.textContent = "AC is ON";
  } else {
    roomStatusIndicator.className = "room-status-indicator status-unused";
    statusIcon.className = "fas fa-door-closed";
    statusText.textContent = "Room Not Used";
    statusDetail.textContent = "AC is OFF";
  }
}

export {
  updateRefreshTime,
  updateCurrentDate,
  setDefaultData,
  updateRoomStatus,
};
