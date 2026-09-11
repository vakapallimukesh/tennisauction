const db = require('../config/db');

exports.getSponsors = async (req, res) => {
  try {
    const store = db.getMemoryStore();
    res.json({ success: true, count: store.sponsors.length, data: store.sponsors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
