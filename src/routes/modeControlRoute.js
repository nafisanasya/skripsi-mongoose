import express from "express";
import {
  getCurrentMode,
  createMode,
} from "../controller/modeControlController.js";

const router = express.Router();

// Simpan setting mode baru (Auto/Manual)
router.post("/", createMode);

// Ambil setting mode saat ini (Latest)
router.get("/", getCurrentMode);

export default router;
