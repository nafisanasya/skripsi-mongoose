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
      // HAPUS default: "OFF"
    },

    temperature: {
      type: Number,
      min: 16,
      max: 30,
      default: 22, // Default suhu aman kalau user lupa set
    },
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ModeControl = mongoose.model("ModeControl", modeSchema);
export default ModeControl;