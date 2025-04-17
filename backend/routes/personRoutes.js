router.post("/persons", async (req, res) => {                   //Create a route to post a missing person reports using name, age, status, last_seen, date
    const { name, age, status, last_seen, date } = req.body;
    const reported_by = req.user?.user_id || 10; // fallback for testing
  
    console.log("last_seen:", last_seen);
    console.log("date:", date);
  
    try {
      const query = `
        INSERT INTO persons (name, age, reported_by, status, last_seen, date)           
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;                                                //Writes a query to insert in the databse 
  
      const values = [
        name,
        age,
        reported_by,
        status,                                                 //Matches the values in the placeholder
        last_seen,
        date
      ];
  
      console.log("Values:", values);
  
      const result = await db.query(query, values);
      res.status(201).json(result.rows[0]);              //Gets the inserted person data
      const personId = person.id;
  
      const alertMessage = `A new missing person report was submitted (Case #${personId}).`;    //Alert message when case has been submitted
  
      
      await db.query(
        "INSERT INTO alerts (type, message, related_person_id, role_target) VALUES ($1, $2, $3, $4)",         //Insert ALERT for admins
        ["new_case", alertMessage, personId, "admin"]
      );
  
      
      await db.query(
        "INSERT INTO alerts (type, message, related_person_id, role_target) VALUES ($1, $2, $3, $4)",       //Insert ALERT for police
        ["new_case", alertMessage, personId, "police"]
      );
  
  
      await db.query(
        "INSERT INTO alerts (type, message, related_person_id, user_target) VALUES ($1, $2, $3, $4)",       //Insert alerts for the reporter who sibmitted it
        ["new_case", "Your missing person report was successfully submitted.", personId, reported_by]
      );
  
      res.status(201).json(person)
    } catch (err) {
      console.error("ERROR:", err);
      res.status(500).json({ message: "Server error", error: err.detail });
    }
  });
  