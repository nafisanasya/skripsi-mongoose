import express from "express";
import client from "../mqtt/mqttClient.js";

const router = express.Router();

// SIMPAN SNAPSHOT TERAKHIR (IN-MEMORY)
let latestSnapshot = {
  snapshot_file: null,
  people_count: 0,
  timestamp: null,
};

// STATUS PROSES SNAPSHOT (BARU)
let snapshotProcessing = false;

// MQTT LISTENER (AMBIL DATA DARI RASPBERRY PI)
client.on("message", (topic, message) => {
  if (topic === "microlab/occupancy") {
    try {
      const data = JSON.parse(message.toString());

      if (data.snapshot_file) {
        latestSnapshot = {
          snapshot_file: data.snapshot_file,
          people_count: data.people_count,
          timestamp: data.timestamp,
        };

        // ✅ SNAPSHOT SUDAH SELESAI DIPROSES
        snapshotProcessing = false;

        console.log("🖼️ Latest snapshot updated:", latestSnapshot);
      }
    } catch (err) {
      console.error("❌ Gagal parse occupancy snapshot:", err.message);
    }
  }
});

// GET SNAPSHOT TERBARU (DIPAKAI FRONTEND)
router.get("/latest", (req, res) => {
  if (!latestSnapshot.snapshot_file) {
    return res.status(404).json({
      success: false,
      message: "Snapshot belum tersedia",
    });
  }

  res.json({
    snapshot_file: latestSnapshot.snapshot_file,
    people_count: latestSnapshot.people_count,
    timestamp: latestSnapshot.timestamp,

    processing: snapshotProcessing,
  });
});

// POST SNAPSHOT REFRESH (TRIGGER RASPBERRY PI)
let lastRefreshTime = 0;

router.post("/refresh", (req, res) => {
  console.log("📸 Manual Snapshot Refresh Request");

  const now = Date.now();

  if (now - lastRefreshTime < 5000) {
    return res.status(429).json({
      success: false,
      message: "Snapshot masih diproses, silakan tunggu",
    });
  }

  lastRefreshTime = now;

  // SET STATUS: SEDANG DIPROSES
  snapshotProcessing = true;

  const topic = "microlab/snapshot/refresh";

  const payload = JSON.stringify({
    action: "REFRESH",
    source: "web",
    timestamp: new Date(),
  });

  client.publish(topic, payload, { qos: 0, retain: false }, (err) => {
    if (err) {
      console.error("❌ Gagal mengirim snapshot refresh:", err);

      snapshotProcessing = false;

      return res.status(500).json({
        success: false,
        message: "Gagal memicu snapshot",
      });
    }

    console.log(`📡 Snapshot refresh terkirim ke ${topic}`);

    // FRONTEND TETAP BUFFERING SAMPAI processing = false
    res.json({
      success: true,
      message: "Snapshot refresh diproses",
    });
  });
});

export default router;
