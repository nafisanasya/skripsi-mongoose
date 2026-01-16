import mongoose from "mongoose";

const modeSchema = new mongoose.Schema({
  mode: {
    type: String,
    required: true,
    enum: ["auto", "manual"],
    default: "auto",
  },

  // Settingan Manual (Hanya terisi jika tombol Apply ditekan)
  manualState: {
    acFront: {
      type: String,
      enum: ["ON", "OFF"],
    },
    acSide: {
      type: String,
      enum: ["ON", "OFF"],
    },

    // SUHU TERPISAH UNTUK AC DEPAN DAN SAMPING
    temperatureFront: {
      type: Number,
      min: 16,
      max: 30,
      default: 25, // Default suhu untuk AC depan
    },
    temperatureSide: {
      type: Number,
      min: 16,
      max: 30,
      default: 25, // Default suhu untuk AC samping
    },

    // Untuk kompatibilitas dengan ESP32 lama (satu slider)
    temperature: {
      type: Number,
      min: 16,
      max: 30,
      default: 25,
    },
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ModeControl = mongoose.model("ModeControl", modeSchema);
export default ModeControl;
