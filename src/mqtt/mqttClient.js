import mqtt from "mqtt";
import Dht22 from "../models/dht22Model.js";
import { io } from "../index.js"; // <--- WAJIB, untuk realtime

// MQTT Broker
const MQTT_BROKER = "mqtt://microlabmonitoring.cloud:1883";
const MQTT_USER = "skripsi";
const MQTT_PASS = "bismillahsidang";

const options = {
  username: MQTT_USER,
  password: MQTT_PASS,
  reconnectPeriod: 2000,
};

const client = mqtt.connect(MQTT_BROKER, options);

// MQTT Connected
client.on("connect", () => {
  console.log("✅ MQTT Connected to microlabmonitoring.cloud");

  // Subscribe ke topik sensor
  client.subscribe("microlab/dht22/front", { qos: 1 });
  client.subscribe("microlab/dht22/side", { qos: 1 });

  console.log("📡 Subscribed to MQTT topics");
});

// MQTT Message Handler
client.on("message", async (topic, message) => {
  try {
    const jsonString = message.toString();
    const data = JSON.parse(jsonString);

    console.log("📩 MQTT Data Received:", data);

    // ==== SAVE TO DATABASE =====
    const newData = new Dht22({
      location: data.location,
      temperature: data.temperature,
      humidity: data.humidity,
      timestamp: new Date(),
    });

    await newData.save();
    console.log("💾 Saved to MongoDB:", data.location);

    // ==== BROADCAST REALTIME (WebSocket) =====
    io.emit("newDhtData", {
      location: data.location,
      temperature: data.temperature,
      humidity: data.humidity,
      timestamp: new Date(),
    });

    console.log("📡 Sent realtime to clients");
  } catch (err) {
    console.error("❌ Error processing MQTT data:", err.message);
  }
});

// Error handler
client.on("error", (err) => {
  console.error("❌ MQTT Error:", err.message);
});

// Export client
export default client;
