import express from "express";
import {
  getAllFuzzy,
  getFuzzyByLocation,
  getLatestFuzzy,
  createFuzzy,
} from "../controller/outputFuzzyController.js";

const router = express.Router();

// Simpan data fuzzy baru
router.post("/", createFuzzy);

// Ambil semua data fuzzy
router.get("/", getAllFuzzy);

// Ambil data fuzzy berdasarkan lokasi (front, side)
router.get("/:location", getFuzzyByLocation);

// Ambil data fuzzy terbaru berdasarkan lokasi
router.get("/:location/latest", getLatestFuzzy);

export default router;
