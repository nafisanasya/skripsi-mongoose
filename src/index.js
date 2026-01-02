import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import dht22Routes from "./routes/dht22Route.js";
import occupancyRoutes from "./routes/occupancyRoute.js";
import ACStatusRoutes from "./routes/ACStatusRoute.js";
import outputFuzzyRoutes from "./routes/outputFuzzyRoute.js";

// Middleware
import logRequest from "./middleware/logs.js";

// MQTT Client (listener only)
import "./mqtt/mqttClient.js";

const app = express();
dotenv.config();

// Middleware
app.use(logRequest);
app.use(express.json());
app.use(cors());

// Config
const PORT = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO_URL;

// Routes
app.use("/api/dht22", dht22Routes);
app.use("/api/occupancy", occupancyRoutes);
app.use("/snapshot", express.static("/var/www/html/snapshot"));
app.use("/api/ac-status", ACStatusRoutes);
app.use("/api/fuzzy", outputFuzzyRoutes);

// Route default untuk testing
app.get("/api", (req, res) => {
  res.json({
    message: "Smart Room Monitoring API is running 🚀",
    database: "MongoDB Connected",
    endpoints: {
      dht22: {
        getAll: "GET /api/dht22",
        getByLocation: "GET /api/dht22/:location",
        getLatestDht: "GET /api/dht22/:location/latest",
        create: "POST /api/dht22",
      },
      occupancy: {
        getAll: "GET /api/occupancy",
        getLatest: "GET /api/occupancy/latest",
        create: "POST /api/occupancy (optional)",
      },
      snapshot: {
        latest: "GET /snapshot/occupancy.jpg",
      },
      acStatus: {
        all: "GET /api/ac-status",
        front: "GET /api/ac-status/front",
        side: "GET /api/ac-status/side",
      },
      fuzzy: {
        getAll: "GET /api/fuzzy",
        getByLocation: "GET /api/fuzzy/:location",
        getLatest: "GET /api/fuzzy/:location/latest",
        create: "POST /api/fuzzy",
      },
    },
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// MongoDB connection
mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });
