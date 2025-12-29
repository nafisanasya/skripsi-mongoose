import express from "express";
import { acStatus } from "../mqtt/mqttClient.js";

const router = express.Router();

// AC Depan dan Samping
router.get("/", (req, res) => {
  res.json({
    front: acStatus.front,
    side: acStatus.side,
    timestamp: new Date(),
  });
});

// AC Depan
router.get("/front", (req, res) => {
  res.json({
    location: "front",
    status: acStatus.front,
    timestamp: new Date(),
  });
});

// AC Samping
router.get("/side", (req, res) => {
  res.json({
    location: "side",
    status: acStatus.side,
    timestamp: new Date(),
  });
});

export default router;
