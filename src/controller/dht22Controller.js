import DHT22 from "../models/dht22Model.js";

// Ambil semua data sensor
const getAllDht = async (req, res) => {
  try {
    const data = await DHT22.find().sort({ timestamp: -1 });
    res.json({
      message: "GET all DHT data success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Ambil data berdasarkan lokasi
const getDhtByLocation = async (req, res) => {
  const { location } = req.params;

  try {
    const data = await DHT22.find({ location }).sort({ timestamp: -1 });
    res.json({
      message: `GET DHT ${location} data success`,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Ambil data terbaru per lokasi
const getLatestDht = async (req, res) => {
  const { location } = req.params;

  try {
    const data = await DHT22.findOne({ location }).sort({ timestamp: -1 });

    if (!data) {
      return res.status(404).json({
        message: `No data found for location: ${location}`,
        data: null,
      });
    }

    res.json({
      message: `GET latest DHT ${location} data success`,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Simpan data sensor baru
const createDht = async (req, res) => {
  const { location, temperature, humidity } = req.body;

  // Validasi input
  if (!location || temperature === undefined || humidity === undefined) {
    return res.status(400).json({
      message: "Location, temperature, and humidity are required",
    });
  }

  try {
    const newData = await DHT22.create({
      location,
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
    });

    res.status(201).json({
      message: "CREATE new DHT data success",
      data: newData,
    });
  } catch (error) {
    // Tangani error validasi Mongoose
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation Error",
        error: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

export { getAllDht, getDhtByLocation, getLatestDht, createDht };
