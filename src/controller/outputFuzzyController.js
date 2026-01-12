import OutputFuzzy from "../models/outputFuzzyModel.js";

// Ambil semua data output fuzzy
const getAllFuzzy = async (req, res) => {
  try {
    const data = await OutputFuzzy.find().sort({ timestamp: -1 });
    res.json({
      message: "GET all Fuzzy output data success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Ambil data fuzzy berdasarkan lokasi
const getFuzzyByLocation = async (req, res) => {
  const { location } = req.params;

  try {
    const data = await OutputFuzzy.find({ location }).sort({ timestamp: -1 });
    res.json({
      message: `GET Fuzzy ${location} data success`,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Ambil data fuzzy terbaru per lokasi
const getLatestFuzzy = async (req, res) => {
  const { location } = req.params;

  try {
    const data = await OutputFuzzy.findOne({ location }).sort({
      timestamp: -1,
    });

    if (!data) {
      return res.status(404).json({
        message: `No data found for location: ${location}`,
        data: null,
      });
    }

    res.json({
      message: `GET latest Fuzzy ${location} data success`,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Simpan data fuzzy baru (Test Input Manual)
const createFuzzy = async (req, res) => {
  const { location, temperature } = req.body;

  // Validasi input (Fuzzy hanya butuh location & temperature)
  if (!location || temperature === undefined) {
    return res.status(400).json({
      message: "Location and temperature are required",
    });
  }

  try {
    // Simpan hasil perhitungan Fuzzy ke Database
    const newData = await OutputFuzzy.create({
      location,
      temperature: parseFloat(temperature),
    });

    res.status(201).json({
      message: "CREATE new Fuzzy output success",
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

export { getAllFuzzy, getFuzzyByLocation, getLatestFuzzy, createFuzzy };
