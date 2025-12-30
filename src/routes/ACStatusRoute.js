import express from "express";
// PENTING: Import 'client' agar bisa kirim perintah ke MQTT (ESP32)
import client, { acStatus } from "../mqtt/mqttClient.js";

const router = express.Router();

// -----------------------------------------------------------
// GET ROUTES (Untuk mengambil data status saat ini)
// -----------------------------------------------------------

// 1. Ambil Status Semua AC
router.get("/", (req, res) => {
  res.json({
    front: acStatus.front,
    side: acStatus.side,
    timestamp: new Date(),
  });
});

// 2. Ambil Status AC Depan Saja
router.get("/front", (req, res) => {
  res.json({
    location: "front",
    status: acStatus.front,
    timestamp: new Date(),
  });
});

// 3. Ambil Status AC Samping Saja
router.get("/side", (req, res) => {
  res.json({
    location: "side",
    status: acStatus.side,
    timestamp: new Date(),
  });
});

// -----------------------------------------------------------
// POST ROUTE (Untuk Mengontrol AC dari Web)
// -----------------------------------------------------------
router.post("/control", (req, res) => {
  // Terima data dari Frontend
  const { location, action, temperature } = req.body;

  console.log(
    `🎮 Manual Control Request: AC ${location} -> ${action} (${temperature}°C)`
  );

  // Validasi Data
  if (!location || !action) {
    return res
      .status(400)
      .json({ success: false, message: "Data tidak lengkap" });
  }

  // 1. UPDATE STATUS DI MEMORY BACKEND (PENTING!)
  // Ini mencegah status kembali ke "OFF" saat frontend melakukan refresh otomatis
  if (location === "front") {
    acStatus.front = action;
  } else if (location === "side") {
    acStatus.side = action;
  }

  // 2. KIRIM PERINTAH KE ALAT (MQTT)
  // Topik: microlab/ac-control/front
  const topic = `microlab/ac-control/${location}`;

  // Payload JSON untuk ESP32
  const payload = JSON.stringify({
    action: action, // "ON" atau "OFF"
    temp: temperature || 24, // Suhu (Default 24)
  });

  // Publish ke MQTT Broker
  client.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) {
      console.error("❌ Gagal mengirim MQTT:", err);
      return res
        .status(500)
        .json({ success: false, message: "Gagal mengirim perintah ke alat" });
    }

    console.log(`📡 Perintah terkirim ke topik ${topic}: ${payload}`);

    // Balas ke Frontend bahwa sukses
    res.json({
      success: true,
      message: `Berhasil mengubah AC ${location} menjadi ${action}`,
      currentStatus: acStatus,
    });
  });
});

export default router;
