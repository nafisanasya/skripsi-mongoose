import express from "express";
import {
  getAllOccupancy,
  getLatestOccupancy,
  createOccupancy,
} from "../controller/occupancyController.js";

const router = express.Router();

// Input manual
router.post("/", createOccupancy);

// Ambil semua data occupancy
router.get("/", getAllOccupancy);

// Ambil data occupancy terbaru
router.get("/latest", getLatestOccupancy);

export default router;
