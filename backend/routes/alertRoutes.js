const express = require("express");
const pool = require("../config/db");         

const router = express.Router();    //mini router that handles requets related to alerts


router.get("/alerts", async (req, res) => {                               //Gets and sends all alerts
  try {
    const result = await pool.query(
      "SELECT * FROM alerts ORDER BY created_at DESC"           //Fetchs all the alerts from the alert table from the database.
    );
    res.json(result.rows);                //shows the result of all alerts fetched 
  } catch (err) {
    console.error("Error fetching alerts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
