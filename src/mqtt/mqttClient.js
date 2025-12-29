import mqtt from "mqtt";
import Dht22 from "../models/dht22Model.js";
import Occupancy from "../models/occupancyModel.js";

const MQTT_BROKER = "mqtt://microlabmonitoring.cloud:1883";
const MQTT_USER = "skripsi";
const MQTT_PASS = "bismillahsidang";

const options = {
  username: MQTT_USER,
  password: MQTT_PASS,
  reconnectPeriod: 2000,
};

const client = mqtt.connect(MQTT_BROKER, options);

// Status AC (Tanpa Database)
const acStatus = {
  front: "OFF",
  side: "OFF",
};

// Connect
client.on("connect", () => {
  console.log("✅ MQTT Connected to microlabmonitoring.cloud");

  // Subscribe ke 3 topik (DHT22)
  client.subscribe("microlab/dht22/front", { qos: 1 });
  client.subscribe("microlab/dht22/side", { qos: 1 });
  client.subscribe("microlab/dht22/back", { qos: 1 });

  // Subscribe Occupancy (YOLO CCTV)
  client.subscribe("microlab/occupancy", { qos: 1 });

  // Subscribe ke 2 topik (ACS712)
  client.subscribe("microlab/ac/front", { qos: 1 });
  client.subscribe("microlab/ac/side", { qos: 1 });

  console.log("📡 Subscribed to MQTT topics");
});

// Pesan diterima
client.on("message", async (topic, message) => {
  try {
    const jsonString = message.toString();
    const data = JSON.parse(jsonString);

    console.log("📩 MQTT Data:", data);

    // Simpan DHT22 ke mongoDB
    if (topic.startsWith("microlab/dht22")) {
      const newData = new Dht22({
        location: data.location,
        temperature: data.temperature,
        humidity: data.humidity,
        timestamp: new Date(),
      });

      await newData.save();
      console.log("💾 Saved to MongoDB:", data.location);
    }

    // Occupancy (YOLO CCTV)
    if (topic === "microlab/occupancy") {
      const newOccupancy = new Occupancy({
        people_count: data.people_count,
        timestamp: new Date(),
      });

      await newOccupancy.save();
      console.log("👤 Occupancy saved:", data.people_count);
    }

    // ACS712 (Tanpa Database)
    if (topic === "microlab/ac/front") {
      acStatus.front = data.ac_front;
      console.log("⚡ AC FRONT:", acStatus.front);
    }
    if (topic === "microlab/ac/side") {
      acStatus.side = data.ac_side;
      console.log("⚡ AC SIDE:", acStatus.side);
    }
  } catch (err) {
    console.error("❌ Error saving MQTT data:", err.message);
  }
});

export { acStatus };
export default client;
