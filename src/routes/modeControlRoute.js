import express from "express";
import {
  getCurrentMode,
  createMode,
} from "../controller/modeControlController.js";

const router = express.Router();

// Simpan setting mode baru (Auto/Manual)
// Endpoint: POST /api/mode-control (tergantung prefix di index.js)
router.post("/", createMode);

// Ambil setting mode saat ini (Latest)
// Endpoint: GET /api/mode-control
router.get("/", getCurrentMode);

export default router;
