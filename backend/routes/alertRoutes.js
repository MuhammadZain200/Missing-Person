const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware"); // Ensure this path matches your setup

const router = express.Router();

// GET /alerts - Fetch alerts relevant to the logged-in user (role-based or user-specific)
router.get("/alerts", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const result = await pool.query(
      `SELECT alerts.*, persons.name AS person_name
       FROM alerts
       LEFT JOIN persons ON alerts.related_person_id = persons.id
       WHERE role_target = $1 OR user_target = $2 OR (role_target IS NULL AND user_target IS NULL)
       ORDER BY alerts.created_at DESC`,
      [userRole, userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /alerts/:id/seen - Mark a specific alert as seen
router.put("/alerts/:id/seen", authenticateToken, async (req, res) => {
  const alertId = req.params.id;

  try {
    const result = await pool.query(
      "UPDATE alerts SET seen = TRUE WHERE id = $1 RETURNING *",
      [alertId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error marking alert as seen:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /alerts/unseen-count - Get number of unseen alerts for logged-in user
router.get("/alerts/unseen-count", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) 
       FROM alerts 
       WHERE seen = FALSE AND (
         role_target = $1 OR user_target = $2 OR (role_target IS NULL AND user_target IS NULL)
       )`,
      [userRole, userId]
    );
    res.json({ unseenCount: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error("Error fetching unseen alert count:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
