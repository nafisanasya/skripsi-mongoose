import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dht22Routes from "./routes/dht22Route.js";
import logRequest from "./middleware/logs.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
dotenv.config();

// HTTP server (Express + WebSocket)
const server = http.createServer(app);

// WebSocket server
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Socket event
io.on("connection", (socket) => {
  console.log("⚡ WebSocket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ WebSocket disconnected:", socket.id);
  });
});

// Middleware
app.use(logRequest);
app.use(express.json());

app.use(cors());

// Config
const PORT = process.env.PORT || 8000;
const MONGOURL = process.env.MONGO_URL;

// Routes DHT22
app.use("/api/dht22", dht22Routes);

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

import "./mqtt/mqttClient.js";
