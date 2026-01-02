import mongoose from "mongoose";

const fuzzySchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    enum: ["front", "side"],
  },
  temperature: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 259200, // TTL 72 jam = 3 hari
  },
});

const OutputFuzzy = mongoose.model("OutputFuzzy", fuzzySchema);
export default OutputFuzzy;
