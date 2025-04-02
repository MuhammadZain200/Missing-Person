require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");                         //Loaded dependicies
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const aiRoutes = require("./routes/AIRoutes");
const alertRoutes = require("./routes/alertRoutes");

const app = express();  //Express server being setup


app.use((req, res, next) => {             
  if (
    req.headers["content-type"] === "application/json" &&
    typeof req.body === "string"
  ) {                                                                 //
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
  next();
});

app.use(express.json()); // Main JSON parser
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.json()); // Explicit JSON body parser

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);               //JWT Authentication for Users
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

const authenticateAdmin = (req, res, next) => {
  authenticateUser(req, res, () => {
    if (req.user.role !== "admin")                                                                              //JWT Authentication for Admins
      return res.status(403).json({ error: "Access denied. Admins only." });
    next();
  });
};

app.get("/", (req, res) => {
  res.send("API is running...");                                        //Checks if API is working
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email, and password are required" });

    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0)
      return res.status(400).json({ error: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);                                               //Registers Users and stores them in the PostgreSQL

    const userRole = role || "user";
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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.rows[0].password);                                  //Admins and User can Login uisng Email and Password
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { user_id: user.rows[0].user_id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { user_id, name, email: userEmail, role } = user.rows[0];
    res.json({ token, role, user: { user_id, name, email: userEmail, role } });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/persons", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT persons.*, users.name AS reported_by_name FROM persons LEFT JOIN users ON persons.reported_by = users.user_id"
    );
    res.json(result.rows);
  } catch (err) {                                                                 //Gets all the missing persons reported
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/persons/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const person = await pool.query(
      "SELECT persons.*, users.name AS reported_by_name FROM persons LEFT JOIN users ON persons.reported_by = users.user_id WHERE persons.id = $1",
      [parseInt(id)]
    );
    if (person.rows.length === 0) return res.status(404).json({ error: "Person not found" });                     //Gets specific case based on the user ID
    res.json(person.rows[0]);
  } catch (err) {
    console.error("Error fetching person:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
                                                                                          //Configure multer for image uploaded type 
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb("Error: Images only!");
  }
});

app.post("/persons", authenticateUser, upload.single("image"), async (req, res) => {
  try {
    const { name, age, status, last_seen, date, additional_info, last_seen_lat, last_seen_lng } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !age || !status || !last_seen || !date) {                                              //Reports a new case with Image (Optional)
      return res.status(400).json({ error: "Missing required fields" });
    }

    const reportedById = req.user.user_id;

    const result = await pool.query(
      `INSERT INTO persons (name, age, status, reported_by, last_seen, date, image, additional_info, last_seen_lat, last_seen_lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, age, status, reportedById, last_seen, date, image, additional_info, last_seen_lat, last_seen_lng]
    );

    await pool.query(
      "INSERT INTO alerts (type, message, related_person_id) VALUES ($1, $2, $3)",
      ["new_report", `🆕 New case reported: ${name}`, result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Backend Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/persons/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const personExists = await pool.query("SELECT * FROM persons WHERE id = $1", [parseInt(id)]);
    if (personExists.rows.length === 0) return res.status(404).json({ error: "Person not found" });

    await pool.query("DELETE FROM persons WHERE id = $1", [parseInt(id)]);
    res.json({ message: "Person deleted successfully" });                                         //Deletes a report by ADMINS only
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.put("/persons/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const changedBy = req.user.user_id;

    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }

    const person = await pool.query("SELECT status FROM persons WHERE id = $1", [parseInt(id)]);                    //Updates the cases status ADMINS ONLY
    if (person.rows.length === 0) {
      return res.status(404).json({ error: "Person not found" });
    }

    const previousStatus = person.rows[0].status;

    await pool.query(
      "INSERT INTO status_history (person_id, previous_status, new_status, changed_by) VALUES ($1, $2, $3, $4)",
      [parseInt(id), previousStatus, status, changedBy]
    );

    const updatedPerson = await pool.query(
      "UPDATE persons SET status = $1 WHERE id = $2 RETURNING *",
      [status, parseInt(id)]
    );

    res.json({
      message: "Status updated successfully",
      person: updatedPerson.rows[0]
    });
  } catch (err) {
    console.error("Update Status Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.put("/users/:id/role", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["admin", "user", "police", "volunteer"];                  //Changes the accounr roles to admin,user,police or volunteer
    if (!validRoles.includes(role))
      return res.status(400).json({ error: "Invalid role" });

    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *",
      [role, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "Role updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Role Update Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.use("/", aiRoutes);                     //AI and Alert Routes
app.use("/", alertRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {                                                      //Tells us that the server is running on a specific port
  console.log(`Server running on port ${PORT}`);
});
