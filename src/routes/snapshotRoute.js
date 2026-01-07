import express from "express";
// PENTING: Import 'client' agar bisa kirim perintah ke MQTT (Raspberry Pi)
import client from "../mqtt/mqttClient.js";

const router = express.Router();

// 1. Ambil info snapshot terakhir
router.get("/", (req, res) => {
  res.json({
    snapshot: "occupancy.jpg",
    timestamp: new Date(),
  });
});

// -----------------------------------------------------------
// POST ROUTE (Untuk Refresh Snapshot dari Web)
// -----------------------------------------------------------
router.post("/refresh", (req, res) => {
  console.log("📸 Manual Snapshot Refresh Request");

  // Topic MQTT untuk trigger snapshot
  const topic = "microlab/snapshot/refresh";

  // Payload sederhana
  const payload = JSON.stringify({
    action: "REFRESH",
    source: "web",
    timestamp: new Date(),
  });

  // Publish ke MQTT Broker
  client.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) {
      console.error("❌ Gagal mengirim snapshot refresh:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal memicu snapshot",
      });
    }

    console.log(`📡 Snapshot refresh terkirim ke ${topic}`);

    // Balas ke Frontend
    res.json({
      success: true,
      message: "Snapshot refresh berhasil dikirim",
    });
  });
});

export default router;
