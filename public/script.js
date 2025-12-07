// Konfigurasi API sesuai dengan backend
const API_BASE = "http://localhost:8000/api";

// Debugging - Log ketika script dimuat
console.log("✅ Script.js loaded successfully");

// Update waktu terakhir refresh
function updateRefreshTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  document.getElementById("update-time").textContent = timeString;
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
  document.getElementById("current-date").textContent = dateString;
}

// Set semua data ke nilai default (-)
function setDefaultData() {
  console.log("🔄 Setting default data...");

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

  // Set occupancy to '-'
  const occupancyElement = document.querySelector(".status-item .status-value");
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
    console.error("❌ Room status indicator not found!");
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

// Fungsi untuk mengirim mode ke backend
async function setSystemMode(mode) {
  try {
    const response = await fetch(`${API_BASE}/system/mode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: mode }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ System mode set to ${mode}:`, result);
    return result;
  } catch (error) {
    console.error("❌ Error setting system mode:", error);
    throw error;
  }
}

// Fungsi untuk mengontrol AC secara manual
async function controlAC(acFront, acSide) {
  try {
    const response = await fetch(`${API_BASE}/ac/control`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ac_front: {
          status: acFront.status ? "ON" : "OFF",
          temperature: acFront.temperature,
        },
        ac_side: {
          status: acSide.status ? "ON" : "OFF",
          temperature: acSide.temperature,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ AC control result:", result);
    return result;
  } catch (error) {
    console.error("❌ Error controlling AC:", error);
    throw error;
  }
}

// Fungsi untuk update data dari backend
async function fetchDataFromBackend() {
  try {
    console.log("🔄 Starting to fetch data from backend...");

    // Ambil data dari MySQL untuk front, side, dan back secara parallel
    const [frontResponse, sideResponse, backResponse] = await Promise.all([
      fetch(`${API_BASE}/dht22/front/latest`),
      fetch(`${API_BASE}/dht22/side/latest`),
      fetch(`${API_BASE}/dht22/back/latest`),
    ]);

    if (!frontResponse.ok) {
      throw new Error(`Front HTTP error! status: ${frontResponse.status}`);
    }
    if (!sideResponse.ok) {
      throw new Error(`Side HTTP error! status: ${sideResponse.status}`);
    }
    if (!backResponse.ok) {
      throw new Error(`Back HTTP error! status: ${backResponse.status}`);
    }

    const frontData = await frontResponse.json();
    const sideData = await sideResponse.json();
    const backData = await backResponse.json();

    console.log("✅ Front data received:", frontData);
    console.log("✅ Side data received:", sideData);
    console.log("✅ Back data received:", backData);

    // Update UI dengan data dari backend
    updateUIWithBackendData({
      frontData: frontData,
      sideData: sideData,
      backData: backData,
    });
  } catch (error) {
    console.error("❌ Error fetching data from backend:", error);
    // Tetap tampilkan - jika gagal mengambil data
    setDefaultData();
  }
}

// Fungsi untuk update UI dengan data dari backend
function updateUIWithBackendData(data) {
  console.log("📊 Data received in updateUI:", data);

  // Update sensor data dari MySQL
  // Front sensor
  if (data.frontData && data.frontData.data) {
    const sensorFront = document.getElementById("sensor-front");
    if (sensorFront) {
      const temperature = sensorFront.querySelector(".temperature");
      const humidity = sensorFront.querySelector(".humidity");

      if (temperature) {
        temperature.textContent = data.frontData.data.temperature + " °C";
      }
      if (humidity) {
        humidity.textContent =
          "Humidity: " + data.frontData.data.humidity + "%";
      }

      // Add update animation
      sensorFront.classList.add("updated");
      setTimeout(() => sensorFront.classList.remove("updated"), 500);
    }
  }

  // Side sensor
  if (data.sideData && data.sideData.data) {
    const sensorSide = document.getElementById("sensor-side");
    if (sensorSide) {
      const temperature = sensorSide.querySelector(".temperature");
      const humidity = sensorSide.querySelector(".humidity");

      if (temperature) {
        temperature.textContent = data.sideData.data.temperature + " °C";
      }
      if (humidity) {
        humidity.textContent = "Humidity: " + data.sideData.data.humidity + "%";
      }

      sensorSide.classList.add("updated");
      setTimeout(() => sensorSide.classList.remove("updated"), 500);
    }
  }

  // Back sensor
  if (data.backData && data.backData.data) {
    const sensorBack = document.getElementById("sensor-back");
    if (sensorBack) {
      const temperature = sensorBack.querySelector(".temperature");
      const humidity = sensorBack.querySelector(".humidity");

      if (temperature) {
        temperature.textContent = data.backData.data.temperature + " °C";
      }
      if (humidity) {
        humidity.textContent = "Humidity: " + data.backData.data.humidity + "%";
      }

      sensorBack.classList.add("updated");
      setTimeout(() => sensorBack.classList.remove("updated"), 500);
    }
  }

  updateRoomStatus();
  updateRefreshTime();
}

// Initialize DOM elements after page load
function initializeDOMElements() {
  console.log("🔄 Initializing DOM elements...");

  // Debug: Log semua elemen penting
  console.log("🔍 Manual button:", document.getElementById("manual-mode-btn"));
  console.log("🔍 Auto button:", document.getElementById("auto-mode-btn"));
  console.log("🔍 Sensor front:", document.getElementById("sensor-front"));
  console.log("🔍 Sensor side:", document.getElementById("sensor-side"));
  console.log("🔍 Sensor back:", document.getElementById("sensor-back"));
  console.log("🔍 AC Front:", document.getElementById("ac-front"));
  console.log("🔍 AC Side:", document.getElementById("ac-side"));

  // Pastikan semua elemen ada
  const requiredElements = [
    "manual-mode-btn",
    "auto-mode-btn",
    "sensor-front",
    "sensor-side",
    "sensor-back",
    "ac-front",
    "ac-side",
  ];

  requiredElements.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`❌ Missing element: ${id}`);
    } else {
      console.log(`✅ Element found: ${id}`);
    }
  });
}

// Modal functionality
let manualBtn, autoBtn, modal, closeBtn, cancelBtn, applyBtn;
let acFrontSwitch,
  acFrontStatus,
  acFrontTemperature,
  acFrontTemperatureValue,
  acFrontTemperatureControl;
let acSideSwitch,
  acSideStatus,
  acSideTemperature,
  acSideTemperatureValue,
  acSideTemperatureControl;
let modeIndicator;

function initializeEventListeners() {
  console.log("🔄 Initializing event listeners...");

  // Initialize modal elements
  manualBtn = document.getElementById("manual-mode-btn");
  autoBtn = document.getElementById("auto-mode-btn");
  modal = document.getElementById("manual-modal");
  closeBtn = document.querySelector(".close");
  cancelBtn = document.getElementById("cancel-changes");
  applyBtn = document.getElementById("apply-changes");

  // AC Front controls
  acFrontSwitch = document.getElementById("ac-front-switch");
  acFrontStatus = document.getElementById("ac-front-status");
  acFrontTemperature = document.getElementById("ac-front-temperature");
  acFrontTemperatureValue = document.getElementById(
    "ac-front-temperature-value"
  );
  acFrontTemperatureControl = document.getElementById(
    "ac-front-temperature-control"
  );

  // AC Side controls
  acSideSwitch = document.getElementById("ac-side-switch");
  acSideStatus = document.getElementById("ac-side-status");
  acSideTemperature = document.getElementById("ac-side-temperature");
  acSideTemperatureValue = document.getElementById("ac-side-temperature-value");
  acSideTemperatureControl = document.getElementById(
    "ac-side-temperature-control"
  );

  // Mode indicator
  modeIndicator = document.getElementById("mode-indicator");

  // Check if all elements are found
  if (!manualBtn) console.error("❌ manual-mode-btn not found");
  if (!autoBtn) console.error("❌ auto-mode-btn not found");
  if (!modal) console.error("❌ manual-modal not found");

  // Open modal when Manual Mode is clicked
  if (manualBtn) {
    manualBtn.addEventListener("click", async function () {
      console.log("📱 Manual mode button clicked");

      // Update button states
      manualBtn.classList.add("btn-active");
      manualBtn.classList.remove("btn-outline");
      autoBtn.classList.add("btn-outline");
      autoBtn.classList.remove("btn-primary", "btn-active");

      // Update button text
      manualBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Manual Mode';
      autoBtn.innerHTML = '<i class="fas fa-robot"></i> Automatic Mode';

      // Update mode indicator
      if (modeIndicator) {
        modeIndicator.className = "mode-indicator manual";
        modeIndicator.innerHTML =
          '<i class="fas fa-hand-paper"></i> Manual Mode';
      }

      // Show modal
      if (modal) {
        modal.style.display = "block";
      }

      // Initialize switch states based on current device status
      const acItems = document.querySelectorAll(".ac-item");

      // AC Front
      const acFrontElement = acItems[0];
      if (
        acFrontElement &&
        acFrontSwitch &&
        acFrontStatus &&
        acFrontTemperature &&
        acFrontTemperatureValue
      ) {
        const currentACFrontStatus =
          acFrontElement.querySelector(".ac-status").textContent;
        const currentACFrontTemperature =
          acFrontElement.querySelector(".ac-temperature").textContent;

        acFrontSwitch.checked = currentACFrontStatus === "ON";
        acFrontStatus.textContent = currentACFrontStatus;

        // Jika nilai masih '-', set default ke 17
        if (currentACFrontTemperature === "- °C") {
          acFrontTemperature.value = 17;
          acFrontTemperatureValue.textContent = 17;
        } else {
          const tempValue = currentACFrontTemperature.replace(" °C", "");
          acFrontTemperature.value = tempValue;
          acFrontTemperatureValue.textContent = tempValue;
        }
      }

      // AC Side
      const acSideElement = acItems[1];
      if (
        acSideElement &&
        acSideSwitch &&
        acSideStatus &&
        acSideTemperature &&
        acSideTemperatureValue
      ) {
        const currentACSideStatus =
          acSideElement.querySelector(".ac-status").textContent;
        const currentACSideTemperature =
          acSideElement.querySelector(".ac-temperature").textContent;

        acSideSwitch.checked = currentACSideStatus === "ON";
        acSideStatus.textContent = currentACSideStatus;

        // Jika nilai masih '-', set default ke 17
        if (currentACSideTemperature === "- °C") {
          acSideTemperature.value = 17;
          acSideTemperatureValue.textContent = 17;
        } else {
          const tempValue = currentACSideTemperature.replace(" °C", "");
          acSideTemperature.value = tempValue;
          acSideTemperatureValue.textContent = tempValue;
        }
      }

      // Show/hide temperature controls based on AC status
      if (acFrontTemperatureControl) {
        acFrontTemperatureControl.style.display = acFrontSwitch.checked
          ? "block"
          : "none";
      }
      if (acSideTemperatureControl) {
        acSideTemperatureControl.style.display = acSideSwitch.checked
          ? "block"
          : "none";
      }

      // Send mode to backend
      try {
        await setSystemMode("manual");
      } catch (error) {
        console.error("Failed to set manual mode:", error);
        alert("Failed to switch to Manual Mode. Please try again.");
      }
    });
  }

  // Close modal when X is clicked
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      if (modal) modal.style.display = "none";
    });
  }

  // Close modal when Cancel is clicked
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      if (modal) modal.style.display = "none";
    });
  }

  // Apply changes when Apply is clicked
  if (applyBtn) {
    applyBtn.addEventListener("click", async function () {
      console.log("✅ Apply changes clicked");

      // Update AC Front status in the main view
      const acItems = document.querySelectorAll(".ac-item");

      // AC Front
      if (acItems[0]) {
        const temperature = acItems[0].querySelector(".ac-temperature");
        const status = acItems[0].querySelector(".ac-status");

        if (acFrontSwitch && acFrontSwitch.checked) {
          if (temperature)
            temperature.textContent = acFrontTemperature.value + " °C";
          if (status) {
            status.textContent = "ON";
            status.className = "ac-status status-on";
          }
        } else {
          if (temperature) temperature.textContent = "- °C";
          if (status) {
            status.textContent = "OFF";
            status.className = "ac-status status-off";
          }
        }
      }

      // AC Side
      if (acItems[1]) {
        const temperature = acItems[1].querySelector(".ac-temperature");
        const status = acItems[1].querySelector(".ac-status");

        if (acSideSwitch && acSideSwitch.checked) {
          if (temperature)
            temperature.textContent = acSideTemperature.value + " °C";
          if (status) {
            status.textContent = "ON";
            status.className = "ac-status status-on";
          }
        } else {
          if (temperature) temperature.textContent = "- °C";
          if (status) {
            status.textContent = "OFF";
            status.className = "ac-status status-off";
          }
        }
      }

      // Update room status
      updateRoomStatus();

      // Close modal
      if (modal) modal.style.display = "none";

      // Send AC control to backend
      try {
        if (
          acFrontSwitch &&
          acSideSwitch &&
          acFrontTemperature &&
          acSideTemperature
        ) {
          await controlAC(
            {
              status: acFrontSwitch.checked,
              temperature: parseInt(acFrontTemperature.value),
            },
            {
              status: acSideSwitch.checked,
              temperature: parseInt(acSideTemperature.value),
            }
          );
        }
        alert("Manual changes applied successfully!");
      } catch (error) {
        console.error("Failed to apply AC control:", error);
        alert("Failed to apply changes. Please try again.");
      }
    });
  }

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Update status text when AC Front switch is toggled
  if (acFrontSwitch) {
    acFrontSwitch.addEventListener("change", function () {
      if (acFrontStatus)
        acFrontStatus.textContent = acFrontSwitch.checked ? "ON" : "OFF";
      if (acFrontTemperatureControl) {
        acFrontTemperatureControl.style.display = acFrontSwitch.checked
          ? "block"
          : "none";
      }
    });
  }

  // Update status text when AC Side switch is toggled
  if (acSideSwitch) {
    acSideSwitch.addEventListener("change", function () {
      if (acSideStatus)
        acSideStatus.textContent = acSideSwitch.checked ? "ON" : "OFF";
      if (acSideTemperatureControl) {
        acSideTemperatureControl.style.display = acSideSwitch.checked
          ? "block"
          : "none";
      }
    });
  }

  // Update temperature value when AC Front slider is moved
  if (acFrontTemperature && acFrontTemperatureValue) {
    acFrontTemperature.addEventListener("input", function () {
      acFrontTemperatureValue.textContent = acFrontTemperature.value;
    });
  }

  // Update temperature value when AC Side slider is moved
  if (acSideTemperature && acSideTemperatureValue) {
    acSideTemperature.addEventListener("input", function () {
      acSideTemperatureValue.textContent = acSideTemperature.value;
    });
  }

  // Return to automatic mode when Automatic Mode button is clicked
  if (autoBtn) {
    autoBtn.addEventListener("click", async function () {
      console.log("🤖 Auto mode button clicked");

      autoBtn.classList.add("btn-primary", "btn-active");
      autoBtn.classList.remove("btn-outline");
      manualBtn.classList.add("btn-outline");
      manualBtn.classList.remove("btn-active");

      // Update button text
      manualBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Manual Mode';
      autoBtn.innerHTML = '<i class="fas fa-robot"></i> Automatic Mode';

      // Update mode indicator
      if (modeIndicator) {
        modeIndicator.className = "mode-indicator auto";
        modeIndicator.innerHTML = '<i class="fas fa-robot"></i> Auto Mode';
      }

      // If modal is open, close it
      if (modal && modal.style.display === "block") {
        modal.style.display = "none";
      }

      // Send mode to backend
      try {
        await setSystemMode("auto");
      } catch (error) {
        console.error("Failed to set auto mode:", error);
        alert("Failed to switch to Auto Mode. Please try again.");
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 DOM fully loaded, initializing application...");

  updateRefreshTime();
  updateCurrentDate();

  // Initialize DOM elements and debug
  initializeDOMElements();

  // Initialize event listeners
  initializeEventListeners();

  // Set semua data ke default (-)
  setDefaultData();

  // Fetch data dari backend pertama kali
  fetchDataFromBackend();

  // Update refresh time every 10 seconds
  setInterval(updateRefreshTime, 10000);

  // Fetch data dari backend setiap 10 detik
  setInterval(fetchDataFromBackend, 10000);

  console.log("✅ Application initialization complete!");
});
