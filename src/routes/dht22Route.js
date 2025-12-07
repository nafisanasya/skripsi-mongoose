import express from "express";
import {
  getAllDht,
  getDhtByLocation,
  getLatestDht,
  createDht,
} from "../controller/dht22Controller.js";

const router = express.Router();

// Simpan data sensor baru
router.post("/", createDht);

// Ambil semua data
router.get("/", getAllDht);

// Ambil data berdasarkan lokasi (front, back, side)
router.get("/:location", getDhtByLocation);

// Ambil data terbaru berdasarkan lokasi
router.get("/:location/latest", getLatestDht);

export default router;
