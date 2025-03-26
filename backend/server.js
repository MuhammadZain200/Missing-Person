require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const cors = require("cors"); // Enables communication between frontend and backend
const pool = require("./config/db"); // Database connection
const jwt = require("jsonwebtoken"); // Handles user authentication
const bcrypt = require("bcryptjs"); // Used for hashing passwords
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const aiRoutes = require("./routes/AIRoutes");
const alertRoutes = require("./routes/alertRoutes");

const app = express();
app.use(express.json()); // Allows app to process JSON data
app.use(cors()); // Enables cross-origin requests

// Middleware to check if the user has a valid token
const authenticateUser = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }
    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded; // Attach user data (ID, role) to the request
        console.log("Decoded Token:", decoded); // Debugging purposes
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid token." });
    }
};

// Middleware to allow only admins to proceed
const authenticateAdmin = (req, res, next) => {
    authenticateUser(req, res, () => {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        next();
    });
};

// Simple API check to confirm the server is running
app.get("/", (req, res) => {
    res.send("API is running...");
});

// User registration endpoint
app.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        // Check if email is already in use
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Store user details in the database
        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, email, hashedPassword, userRole]
        );

        res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// User login endpoint - returns a JWT token
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find the user in the database
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Compare the provided password with the stored hashed password
        const storedHashedPassword = user.rows[0].password;
        const isValid = await bcrypt.compare(password, storedHashedPassword);
        if (!isValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT token containing user ID and role
        const token = jwt.sign(
            { user_id: user.rows[0].user_id, role: user.rows[0].role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );

        res.json({ token, role: user.rows[0].role });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Fetch all missing persons with reporter name
app.get("/persons", async (req, res) => {
    try {
        const result = await pool.query("SELECT persons.*, users.name AS reported_by_name FROM persons LEFT JOIN users ON persons.reported_by = users.user_id");
        res.json(result.rows);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Fetch details of a specific missing person with reporter name
app.get("/persons/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const person = await pool.query("SELECT persons.*, users.name AS reported_by_name FROM persons LEFT JOIN users ON persons.reported_by = users.user_id WHERE persons.id = $1", [parseInt(id)]);

        if (person.rows.length === 0) {
            return res.status(404).json({ error: "Person not found" });
        }

        res.json(person.rows[0]);
    } catch (err) {
        console.error("Error fetching person:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});


// Add a new missing person with automatic reporter name
app.post("/persons", authenticateUser, async (req, res) => {
    try {
        const { name, age, status, last_seen, date } = req.body;

        console.log("🟢 Incoming Data:", req.body);

        if (!name || !age || !status || !last_seen || !date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // ✅ Store the reporter's ID instead of name
        const reportedById = req.user.user_id;

        // Insert the missing person
        const result = await pool.query(
            "INSERT INTO persons (name, age, status, reported_by, last_seen, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [name, age, status, reportedById, last_seen, date]
        );

        // ✅ Insert an alert for this new report
        await pool.query(
            "INSERT INTO alerts (type, message, related_person_id) VALUES ($1, $2, $3)",
            ["new_report", `🆕 New case reported: ${name}`, result.rows[0].id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Backend Error:", error.message);  // ✅ show in terminal
        res.status(500).json({
            message: "Server error",
            error: error.message,                            // ✅ send to frontend
        });
    }
});


// Delete a missing person record - Admins only
app.delete("/persons/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the person exists
        const personExists = await pool.query("SELECT * FROM persons WHERE id = $1", [parseInt(id)]);
        if (personExists.rows.length === 0) {
            return res.status(404).json({ error: "Person not found" });
        }

        await pool.query("DELETE FROM persons WHERE id = $1", [parseInt(id)]);
        res.json({ message: "Person deleted successfully" });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Update the status of a missing person and log changes
app.put("/persons/:id/status", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const changedBy = req.user.user_id; // Who made the change

        // Get current status
        const person = await pool.query(
            `SELECT persons.status, users.name AS reported_by_name  FROM persons LEFT JOIN users ON persons.reported_by = users.user_id WHERE persons.id = $1`, 
            [parseInt(id)]
        );
        if (person.rows.length === 0) {
            return res.status(404).json({ error: "Person not found" });
        }

        const previousStatus = person.rows[0].status;

        // Log the status change
        await pool.query(
            "INSERT INTO status_history (person_id, previous_status, new_status, changed_by) VALUES ($1, $2, $3, $4)",
            [parseInt(id), previousStatus, status, changedBy]
        );

        // Update the status in the main record
        const updatedPerson = await pool.query(
            "UPDATE persons SET status = $1 WHERE id = $2 RETURNING *",
            [status, parseInt(id)]
        );

        res.json({ message: "Status updated successfully", person: updatedPerson.rows[0] });
    } catch (err) {
        console.error("Update Status Error:", err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

app.put("/users/:id/role", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
  
      const validRoles = ["admin", "user", "police", "volunteer"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
  
      const result = await pool.query(
        "UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *",
        [role, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json({ message: "Role updated successfully", user: result.rows[0] });
    } catch (err) {
      console.error("❌ Role Update Error:", err.message);
      res.status(500).json({ error: "Server Error" });
    }
  });
  

  // Configure Multer to store image temporarily
const upload = multer({
    dest: "uploads/", // create this folder if it doesn't exist
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = filetypes.test(file.mimetype);
      if (extname && mimetype) return cb(null, true);
      cb("Error: Images only!");
    }
  });
  
  
  app.use("/", aiRoutes);
  app.use("/", alertRoutes);

  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
