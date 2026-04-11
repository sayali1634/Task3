const Brand = require('../models/Brand');

// GET all brands
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
