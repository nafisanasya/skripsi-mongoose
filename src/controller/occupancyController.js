import Occupancy from "../models/occupancyModel.js";

// Ambil semua data occupancy
const getAllOccupancy = async (req, res) => {
  try {
    const data = await Occupancy.find().sort({ timestamp: -1 });
    res.json({
      message: "GET all occupancy data success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Ambil data occupancy terbaru
const getLatestOccupancy = async (req, res) => {
  try {
    const data = await Occupancy.findOne().sort({ timestamp: -1 });

    if (!data) {
      return res.status(404).json({
        message: "No occupancy data found",
        data: null,
      });
    }

    res.json({
      message: "GET latest occupancy data success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

// Simpan data occupancy (OPTIONAL via HTTP)
const createOccupancy = async (req, res) => {
  const { people_count } = req.body;

  if (people_count === undefined) {
    return res.status(400).json({
      message: "people_count is required",
    });
  }

  try {
    const newData = await Occupancy.create({
      people_count: parseInt(people_count),
    });

    res.status(201).json({
      message: "CREATE new occupancy data success",
      data: newData,
    });
  } catch (error) {
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

export { getAllOccupancy, getLatestOccupancy, createOccupancy };