import ModeControl from "../models/modeControlModel.js";
import mqttClient from "../mqtt/mqttClient.js";

// Ambil status mode saat ini
const getCurrentMode = async (req, res) => {
  try {
    let currentData = await ModeControl.findOne().sort({ timestamp: -1 });

    if (!currentData) {
      return res.json({
        message: "No mode settings found, default to AUTO",
        data: { mode: "auto" }, // Default aman, gak maksa OFF
      });
    }

    res.json({
      message: "GET current mode success",
      data: currentData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Simpan perubahan mode dan Beritahu ESP32
const createMode = async (req, res) => {
  const { mode, manualState } = req.body;

  // Validasi input
  if (!mode || (mode !== "auto" && mode !== "manual")) {
    return res.status(400).json({
      message: "Invalid mode. Only 'auto' or 'manual' allowed.",
    });
  }

  try {
    // --- PERBAIKAN PENTING: Pastikan temperature adalah INTEGER ---
    let processedManualState = null;

    if (manualState) {
      processedManualState = { ...manualState };

      // 1. Pastikan temperature adalah integer
      if (processedManualState.temperature !== undefined) {
        // Konversi ke integer dengan aman
        const rawTemp = processedManualState.temperature;
        console.log(
          `🌡️ Raw temperature received: ${rawTemp} (type: ${typeof rawTemp})`
        );

        // Konversi dengan berbagai metode untuk memastikan integer
        let tempValue;
        if (typeof rawTemp === "string") {
          tempValue = parseInt(rawTemp);
          console.log(
            `🔄 Converting string "${rawTemp}" to integer: ${tempValue}`
          );
        } else if (typeof rawTemp === "number") {
          tempValue = Math.round(rawTemp);
          console.log(`🔄 Rounding number ${rawTemp} to integer: ${tempValue}`);
        } else {
          tempValue = 25; // fallback
          console.log(
            `⚠️ Unknown temperature type, using default: ${tempValue}`
          );
        }

        // Jika konversi gagal, gunakan default
        if (isNaN(tempValue)) {
          tempValue = 25;
          console.log(
            `⚠️ Temperature conversion failed, using default: ${tempValue}`
          );
        }

        // 2. Clamping ke range 16-30
        if (tempValue < 16) {
          console.log(`📉 Temperature ${tempValue} clamped to 16`);
          tempValue = 16;
        }
        if (tempValue > 30) {
          console.log(`📈 Temperature ${tempValue} clamped to 30`);
          tempValue = 30;
        }

        processedManualState.temperature = tempValue;
        console.log(
          `✅ Final temperature: ${processedManualState.temperature}°C`
        );
      }

      // 3. Pastikan AC status string uppercase
      if (processedManualState.acFront) {
        processedManualState.acFront =
          processedManualState.acFront.toUpperCase();
        console.log(`🔌 AC Front status: ${processedManualState.acFront}`);
      }
      if (processedManualState.acSide) {
        processedManualState.acSide = processedManualState.acSide.toUpperCase();
        console.log(`🔌 AC Side status: ${processedManualState.acSide}`);
      }
    }

    // Simpan ke database dengan manualState yang sudah diproses
    const newData = await ModeControl.create({
      mode,
      manualState: processedManualState, // Gunakan yang sudah diproses
    });

    const topic = "microlab/system/mode";

    let mqttData = {
      mode: mode,
      updatedAt: new Date().toISOString(),
    };

    if (processedManualState) {
      mqttData.manualState = processedManualState; // Kirim yang sudah diproses

      // DEBUG DETAILED
      console.log(
        "🎮 Manual Command Sent (Apply Button):",
        processedManualState
      );
      console.log("📊 MQTT payload structure:", {
        mode: mqttData.mode,
        manualState: {
          acFront: processedManualState.acFront,
          acSide: processedManualState.acSide,
          temperature: {
            value: processedManualState.temperature,
            type: typeof processedManualState.temperature,
          },
        },
      });
    } else {
      console.log("ℹ️ Mode Switched Only (No AC Command Sent).");
    }

    const payload = JSON.stringify(mqttData);
    console.log("📤 Full MQTT payload:", payload);

    if (mqttClient.connected) {
      // retain: true supaya ESP32 ingat mode terakhir kalau restart
      mqttClient.publish(topic, payload, { qos: 1, retain: true });
      console.log(`📢 System Mode changed to [${mode}]. Broadcasted to MQTT.`);
      console.log(`📡 MQTT Topic: ${topic}`);
    } else {
      console.error(
        "⚠️ MQTT Disconnected. ESP32 might not know the mode changed!"
      );
    }

    res.status(201).json({
      message: "Mode updated successfully",
      data: newData,
      mqttSent: mqttData, // Include what was sent to MQTT for debugging
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("❌ Validation Error:", error.errors);
      return res.status(400).json({
        message: "Validation Error",
        error: Object.values(error.errors).map((err) => err.message),
      });
    }

    console.error("❌ Server Error:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export { getCurrentMode, createMode };
