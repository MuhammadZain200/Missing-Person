require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const aiRoutes = require("./routes/AIRoutes");
const alertRoutes = require("./routes/alertRoutes");
const tipRoutes = require("./routes/tipRoutes");
const otpStore = new Map(); // key: email, value: { otp, expiresAt }
const nodemailer = require("nodemailer");
require("dotenv").config();



const app = express();

app.use((req, res, next) => {
  if (
    req.headers["content-type"] === "application/json" &&
    typeof req.body === "string"
  ) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ FIXED: Required for parsing form data
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token)
    return res.status(401).json({ error: "Access denied. No token provided." });
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

const authenticateAdmin = (req, res, next) => {
  authenticateUser(req, res, () => {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Access denied. Admins only." });
    next();
  });
};

app.get("/", (req, res) => {
  res.send("API is running...");
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
    const hashedPassword = await bcrypt.hash(password, salt);

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

    const isValid = await bcrypt.compare(password, user.rows[0].password);
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
  } catch (err) {
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
    if (person.rows.length === 0) return res.status(404).json({ error: "Person not found" });
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

    if (!name || !age || !status || !last_seen || !date) {
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
    res.json({ message: "Person deleted successfully" });
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

    const person = await pool.query("SELECT status FROM persons WHERE id = $1", [parseInt(id)]);
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

    await pool.query(
      "INSERT INTO alerts (type, message, related_person_id) VALUES ($1, $2, $3)",
      [
        status.toLowerCase() === "resolved" ? "resolved" : "status",
        `📢 Case status updated to ${status}`,
        parseInt(id)
      ]
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

    const validRoles = ["admin", "user", "police", "volunteer"];
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

app.get("/tip-stats", authenticateAdmin, async (req, res) => {
  try {
    const tipCounts = await pool.query(`
      SELECT persons.id, persons.name, COUNT(tips.id) as tip_count
      FROM persons
      LEFT JOIN tips ON persons.id = tips.person_id
      GROUP BY persons.id
      ORDER BY tip_count DESC
      LIMIT 5
    `);

    const totalTips = await pool.query("SELECT COUNT(*) FROM tips");

    res.json({
      totalTips: parseInt(totalTips.rows[0].count),
      topTippedCases: tipCounts.rows,
    });
  } catch (err) {
    console.error("Error fetching tip stats:", err.message);
    res.status(500).json({ error: "Failed to fetch tip stats" });
  }
});

app.get("/users", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT user_id, name, email, role FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/homepage-stats", async (req, res) => {
  try {
    const totalReports = await pool.query("SELECT COUNT(*) FROM persons");
    const foundPeople = await pool.query("SELECT COUNT(*) FROM persons WHERE status = 'Resolved'");
    const volunteers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'volunteer'");

    res.json({
      reportsSubmitted: parseInt(totalReports.rows[0].count),
      peopleFound: parseInt(foundPeople.rows[0].count),
      volunteersHelping: parseInt(volunteers.rows[0].count),
    });
  } catch (err) {
    console.error("Error fetching homepage stats:", err);
    res.status(500).json({ error: "Failed to fetch homepage stats" });
  }
});


app.get("/recent-cases", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, last_seen, image 
       FROM persons 
       ORDER BY updated_at DESC NULLS LAST, date DESC 
       LIMIT 3`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching recent cases:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});


app.get("/homepage-recent-cases", async (req, res) => {
  try {
    const recent = await pool.query(`
      SELECT id, name, last_seen, date, image
      FROM persons
      ORDER BY date DESC
      LIMIT 6
    `);
    res.json(recent.rows);
  } catch (err) {
    console.error("Error fetching recent cases:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/profile", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name, email, password } = req.body;

    let query = "UPDATE users SET name = $1, email = $2";
    let values = [name, email];
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      query += ", password = $3 WHERE user_id = $4 RETURNING user_id, name, email, role";
      values.push(hashed, userId);
    } else {
      query += " WHERE user_id = $3 RETURNING user_id, name, email, role";
      values.push(userId);
    }

    const updated = await pool.query(query, values);
    res.json({ message: "Profile updated", user: updated.rows[0] });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});


const sendOTPEmail = require("./utils/sendOTPEmail");

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  const expiresAt = Date.now() + 5 * 60 * 1000; // expires in 5 min

  try {
    await sendOTPEmail(email, otp);
    otpStore.set(email, { otp, expiresAt });
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ error: "No OTP found for this email" });
  if (Date.now() > record.expiresAt) return res.status(400).json({ error: "OTP expired" });
  if (record.otp.toString() !== otp.toString()) return res.status(400).json({ error: "Invalid OTP" });

  otpStore.delete(email); // ✅ Clear after successful verification
  res.json({ message: "OTP verified successfully" });
});


// Store OTPs temporarily in-memory
const loginOtps = {};

app.post("/send-login-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (user.rows.length === 0) return res.status(404).json({ error: "User not found." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  loginOtps[email] = otp;

  // Setup Nodemailer (reuse your existing transporter)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Missing Persons DB" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Login OTP Verification",
    text: `Your OTP is: ${otp}`
  });

  res.json({ message: "OTP sent to email." });
});

app.post("/verify-login-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!otp || !email) return res.status(400).json({ error: "Missing email or OTP." });

  if (loginOtps[email] !== otp) return res.status(400).json({ error: "Invalid OTP." });

  // Cleanup OTP after successful verification
  delete loginOtps[email];

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  const { user_id, name, role } = user.rows[0];

  const token = jwt.sign({ user_id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, user: { user_id, name, email, role }, role });
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});




app.use("/tips", tipRoutes);
app.use("/", aiRoutes);
app.use("/", alertRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});