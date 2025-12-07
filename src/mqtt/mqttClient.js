import mqtt from "mqtt";
import Dht22 from "../models/dht22Model.js";

const MQTT_BROKER = "mqtt://microlabmonitoring.cloud:1883";
const MQTT_USER = "skripsi";
const MQTT_PASS = "bismillahsidang";

const options = {
  username: MQTT_USER,
  password: MQTT_PASS,
  reconnectPeriod: 2000,
};

const client = mqtt.connect(MQTT_BROKER, options);

// Connect
client.on("connect", () => {
  console.log("✅ MQTT Connected to microlabmonitoring.cloud");

  // Subscribe ke 2 topik
  client.subscribe("microlab/dht22/front", { qos: 1 });
  client.subscribe("microlab/dht22/side", { qos: 1 });

  console.log("📡 Subscribed to MQTT topics");
});

// Pesan diterima
client.on("message", async (topic, message) => {
  try {
    const jsonString = message.toString();
    const data = JSON.parse(jsonString);

    console.log("📩 MQTT Data:", data);

    // Simpan ke mongoDB
    const newData = new Dht22({
      location: data.location,
      temperature: data.temperature,
      humidity: data.humidity,
      timestamp: new Date(),
    });

    await newData.save();
    console.log("💾 Saved to MongoDB:", data.location);
  } catch (err) {
    console.error("❌ Error saving MQTT data:", err.message);
  }
});

export default client;
