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

// Simpan perubahan mode DAN Beritahu ESP32
const createMode = async (req, res) => {
  const { mode, manualState } = req.body;

  // Validasi input
  if (!mode || (mode !== "auto" && mode !== "manual")) {
    return res.status(400).json({
      message: "Invalid mode. Only 'auto' or 'manual' allowed.",
    });
  }

  try {
    // 1. Simpan ke Database
    const newData = await ModeControl.create({
      mode,
      manualState,
    });

    // -----------------------------------------------------------
    // UPDATE: KIRIM NOTIFIKASI KE ESP32 LEWAT MQTT
    // -----------------------------------------------------------
    const topic = "microlab/system/mode";

    // --- LOGIKA PERBAIKAN DI SINI ---
    // Kita buat object payload dasar
    let mqttData = {
      mode: mode,
      updatedAt: new Date().toISOString(),
    };

    // HANYA jika ada manualState (Tombol Apply ditekan), baru kita masukkan.
    // Kalau cuma buka modal (manualState undefined), kita JANGAN kirim data AC.
    // Jadi Backend TIDAK LAGI "sok tahu" mematikan AC.
    if (manualState) {
      mqttData.manualState = manualState;
      console.log("🎮 Manual Command Sent (Apply Button):", manualState);
    } else {
      console.log("ℹ️ Mode Switched Only (No AC Command Sent).");
    }

    const payload = JSON.stringify(mqttData);

    if (mqttClient.connected) {
      // retain: true supaya ESP32 ingat mode terakhir kalau restart
      mqttClient.publish(topic, payload, { qos: 1, retain: true });
      console.log(`📢 System Mode changed to [${mode}]. Broadcasted to MQTT.`);
    } else {
      console.error(
        "⚠️ MQTT Disconnected. ESP32 might not know the mode changed!"
      );
    }
    // -----------------------------------------------------------

    res.status(201).json({
      message: "Mode updated successfully",
      data: newData,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        error: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export { getCurrentMode, createMode };
