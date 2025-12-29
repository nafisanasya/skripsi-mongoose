import mongoose from "mongoose";

const occupancySchema = new mongoose.Schema({
  people_count: {
    type: Number,
    required: true,
    min: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 259200, // TTL 72 jam (3 hari)
  },
});

const Occupancy = mongoose.model("Occupancy", occupancySchema);
export default Occupancy;
