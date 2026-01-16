import { API_BASE } from "./config.js";

// Fungsi Mengirim Perubahan Mode (POST) - DIPERBAIKI LAGI
async function setSystemMode(mode, manualData = null) {
  try {
    console.log(`📡 Sending mode to backend: ${mode}`);

    // Debug data yang diterima
    console.log("📦 Raw manualData received:", manualData);

    let payload = { mode: mode };

    if (manualData) {
      // Tentukan nilai suhu berdasarkan format data
      let temperatureFront, temperatureSide;

      if (
        manualData.temperatureFront !== undefined &&
        manualData.temperatureSide !== undefined
      ) {
        temperatureFront = parseInt(manualData.temperatureFront) || 25;
        temperatureSide = parseInt(manualData.temperatureSide) || 25;
        console.log(
          `🌡️ Format baru - Front: ${temperatureFront}°C, Side: ${temperatureSide}°C`
        );
      } else if (manualData.temperature !== undefined) {
        const temp = parseInt(manualData.temperature) || 25;
        temperatureFront = temp;
        temperatureSide = temp;
        console.log(`🌡️ Format lama - Kedua AC: ${temp}°C`);
      } else {
        temperatureFront = 25;
        temperatureSide = 25;
        console.log(`🌡️ Tidak ada data suhu, default: 25°C`);
      }

      // Siapkan payload dengan format yang benar
      payload.manualState = {
        acFront: manualData.acFront || "OFF",
        acSide: manualData.acSide || "OFF",
        temperatureFront: temperatureFront,
        temperatureSide: temperatureSide,
        temperature: temperatureFront,
      };

      console.log("📤 Final payload to backend:");
      console.log(
        `   AC Front: ${payload.manualState.acFront}, Temp: ${payload.manualState.temperatureFront}°C`
      );
      console.log(
        `   AC Side: ${payload.manualState.acSide}, Temp: ${payload.manualState.temperatureSide}°C`
      );
    }

    const response = await fetch(`${API_BASE}/mode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ System mode set to ${mode}:`, result);

    // Verifikasi data yang dikirim ke MQTT
    if (result.mqttSent && result.mqttSent.manualState) {
      console.log("📡 Data yang dikirim ke ESP32 via MQTT:");
      console.log(
        `   AC Front: ${result.mqttSent.manualState.acFront}, Temp: ${result.mqttSent.manualState.temperatureFront}°C`
      );
      console.log(
        `   AC Side: ${result.mqttSent.manualState.acSide}, Temp: ${result.mqttSent.manualState.temperatureSide}°C`
      );

      // Cek apakah suhu sama atau berbeda
      if (
        result.mqttSent.manualState.temperatureFront ===
        result.mqttSent.manualState.temperatureSide
      ) {
        console.log("⚠️ PERINGATAN: Kedua AC memiliki suhu yang sama!");
      } else {
        console.log("✅ SUKSES: AC depan dan samping memiliki suhu berbeda!");
      }
    }

    return result;
  } catch (error) {
    console.error("❌ Error setting system mode:", error);
    throw error;
  }
}

// Fungsi Mengambil Status Saat Ini (GET)
async function getSystemMode() {
  try {
    const response = await fetch(`${API_BASE}/mode`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("❌ Error getting system mode:", error);
    return null;
  }
}

export { setSystemMode, getSystemMode };
