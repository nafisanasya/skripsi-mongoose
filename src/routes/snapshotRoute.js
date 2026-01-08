import express from "express";
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

// 🔒 debounce sederhana (3 detik)
let lastRefreshTime = 0;

router.post("/refresh", (req, res) => {
  console.log("📸 Manual Snapshot Refresh Request");

  const now = Date.now();

  // ⛔ Cegah refresh bertubi-tubi
  if (now - lastRefreshTime < 5000) {
    return res.status(429).json({
      success: false,
      message: "Snapshot masih diproses, silakan tunggu",
    });
  }

  lastRefreshTime = now;

  const topic = "microlab/snapshot/refresh";

  const payload = JSON.stringify({
    action: "REFRESH",
    source: "web",
    timestamp: new Date(),
  });

  // ✅ MQTT command HARUS qos 0 & retain false
  client.publish(topic, payload, { qos: 0, retain: false }, (err) => {
    if (err) {
      console.error("❌ Gagal mengirim snapshot refresh:", err);
      return res.status(500).json({
        success: false,
        message: "Gagal memicu snapshot",
      });
    }

    console.log(`📡 Snapshot refresh terkirim ke ${topic}`);

    res.json({
      success: true,
      message: "Snapshot refresh berhasil dikirim",
    });
  });
});

export default router;
