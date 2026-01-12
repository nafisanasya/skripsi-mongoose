import mongoose from "mongoose";

const modeSchema = new mongoose.Schema({
  mode: {
    type: String,
    required: true,
    enum: ["auto", "manual"], // Membatasi input hanya boleh 'auto' atau 'manual'
    default: "auto", // Defaultnya otomatis saat sistem baru jalan
  },
  // Opsional: Untuk mencatat status AC terakhir saat mode Manual dipilih
  manualState: {
    acFront: {
      type: String,
      enum: ["ON", "OFF"],
      default: "OFF",
    },
    acSide: {
      type: String,
      enum: ["ON", "OFF"],
      default: "OFF",
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ModeControl = mongoose.model("ModeControl", modeSchema);
export default ModeControl;
