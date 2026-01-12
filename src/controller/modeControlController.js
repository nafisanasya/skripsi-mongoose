import ModeControl from "../models/modeControlModel.js";
import mqttClient from "../mqtt/mqttClient.js"; // ✅ 1. Import MQTT Client

// Ambil status mode saat ini (paling baru berdasarkan timestamp)
const getCurrentMode = async (req, res) => {
  try {
    // Cari data mode yang terakhir dibuat (sort descending by timestamp)
    let currentData = await ModeControl.findOne().sort({ timestamp: -1 });

    // Jika database masih kosong (belum pernah disetting), kita anggap default AUTO
    if (!currentData) {
      return res.json({
        message: "No mode settings found, default to AUTO",
        data: { mode: "auto", manualState: { acFront: "OFF", acSide: "OFF" } },
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
  if (!mode) {
    return res.status(400).json({
      message: "Mode (auto/manual) is required",
    });
  }

  // Validasi tambahan: Cek apakah nilai mode valid
  if (mode !== "auto" && mode !== "manual") {
    return res.status(400).json({
      message: "Invalid mode. Only 'auto' or 'manual' allowed.",
    });
  }

  try {
    // 1. Simpan ke Database (Log History)
    const newData = await ModeControl.create({
      mode,
      manualState, // Bisa null/undefined kalau user cuma ganti ke AUTO
    });

    // -----------------------------------------------------------
    // UPDATE: KIRIM NOTIFIKASI KE ESP32 LEWAT MQTT
    // -----------------------------------------------------------

    // Topik khusus untuk memberi tahu sistem ganti mode
    const topic = "microlab/system/mode";

    const payload = JSON.stringify({
      mode: mode, // 'auto' atau 'manual'
      manualState: manualState || { acFront: "OFF", acSide: "OFF" },
      updatedAt: new Date().toISOString(),
    });

    if (mqttClient.connected) {
      // Kita pakai opsi { retain: true }
      // Fungsinya: Jika ESP32 mati/restart, saat nyala dia langsung
      // otomatis menerima pesan terakhir ini (tidak perlu tunggu user klik lagi)
      mqttClient.publish(topic, payload, { qos: 1, retain: true });

      console.log(`📢 System Mode changed to [${mode}]. Broadcasted to MQTT.`);
    } else {
      console.error(
        "⚠️ MQTT Disconnected. ESP32 might not know the mode changed!"
      );
    }
    // -----------------------------------------------------------

    res.status(201).json({
      message: "Mode updated successfully & sent to device",
      data: newData,
    });
  } catch (error) {
    // Tangani error validasi Mongoose
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
