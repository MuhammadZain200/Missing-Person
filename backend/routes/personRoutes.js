router.post("/persons", async (req, res) => {
    const { name, age, status, last_seen, date } = req.body;
    const reported_by = req.user?.user_id || 10; // fallback for testing
  
    console.log("✅ last_seen:", last_seen);
    console.log("✅ date:", date);
  
    try {
      const query = `
        INSERT INTO persons (name, age, reported_by, status, last_seen, date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
  
      const values = [
        name,
        age,
        reported_by,
        status,
        last_seen,
        date
      ];
  
      console.log("🧠 Values:", values);
  
      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("❌ ERROR:", err);
      res.status(500).json({ message: "Server error", error: err.detail });
    }
  });
  