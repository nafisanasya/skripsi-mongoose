import mongoose from "mongoose";

const dhtSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    enum: ["front", "back", "side"],
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 259200, // TTL 72 jam = 3 hari
  },
});

const DHT22 = mongoose.model("DHT22", dhtSchema);
export default DHT22;
