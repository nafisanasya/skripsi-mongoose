import { API_BASE, DEBUG } from "./config.js";
import {
  setDefaultData,
  updateRoomStatus,
  updateRefreshTime,
} from "./utils.js";

// Fungsi untuk update data dari backend
async function fetchDataFromBackend() {
  try {
    if (DEBUG) console.log("🔄 Starting to fetch data from backend...");

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

    if (DEBUG) {
      console.log("✅ Front data received:", frontData);
      console.log("✅ Side data received:", sideData);
      console.log("✅ Back data received:", backData);
    }

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
  if (DEBUG) console.log("📊 Data received in updateUI:", data);

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

export { fetchDataFromBackend, updateUIWithBackendData };
