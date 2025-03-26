const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// Get all alerts (you can filter later by role/user)
router.get("/alerts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM alerts ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching alerts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
