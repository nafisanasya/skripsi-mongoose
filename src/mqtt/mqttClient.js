import mqtt from "mqtt";
import Dht22 from "../models/dht22Model.js";
import Occupancy from "../models/occupancyModel.js";
import OutputFuzzy from "../models/outputFuzzyModel.js";

const MQTT_BROKER = "mqtt://microlabmonitoring.cloud:1883";
const MQTT_USER = "skripsi";
const MQTT_PASS = "bismillahsidang";

const options = {
  username: MQTT_USER,
  password: MQTT_PASS,
  reconnectPeriod: 2000,
};

const client = mqtt.connect(MQTT_BROKER, options);

// Status AC 
const acStatus = {
  front: "OFF",
  side: "OFF",
};

// Suhu AC Berdasarkan Output Fuzzy
const outputFuzzy = {
  front: null,
  side: null,
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
  client.subscribe("microlab/ac-status/front", { qos: 1 });
  client.subscribe("microlab/ac-status/side", { qos: 1 });

  // Subscribe output fuzzy (Setpoint AC)
  client.subscribe("microlab/fuzzy/front", { qos: 1 });
  client.subscribe("microlab/fuzzy/side", { qos: 1 });

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
        snapshot_file: data.snapshot_file,
        timestamp: new Date(),
      });

      await newOccupancy.save();
      console.log("👤 Occupancy saved:", data.people_count);
    }

    // ACS712 
    if (topic === "microlab/ac-status/front") {
      acStatus.front = data.ac_front;
      console.log("⚡ AC FRONT:", acStatus.front);
    }
    if (topic === "microlab/ac-status/side") {
      acStatus.side = data.ac_side;
      console.log("⚡ AC SIDE:", acStatus.side);
    }

    // Output Suhu AC dari Fuzzy
    if (topic.startsWith("microlab/fuzzy")) {
      const newFuzzy = new OutputFuzzy({
        location: data.location,
        temperature: data.temperature,
        timestamp: new Date(),
      });

      await newFuzzy.save();
      console.log("❄️ [DB] Fuzzy Output Saved:", data.location);
    }

    // Snapshot Refresh
    if (topic === "microlab/snapshot/refresh") {
      console.log("🔄 Snapshot refresh command received:", data);
    }
  } catch (err) {
    console.error("❌ Error saving MQTT data:", err.message);
  }
});

export { acStatus };
export default client;
