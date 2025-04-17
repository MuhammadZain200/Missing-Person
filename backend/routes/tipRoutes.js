const express = require("express");
const tipRouter = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authenticateUser = require("../middleware/authMiddleware");
const sendCaseNotification = require("../utils/sendCaseNotification");


const evidenceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/evidence");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: evidenceStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|mp4|mov/;
    const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeValid = allowed.test(file.mimetype);
    if (extValid && mimeValid) {
      cb(null, true);
    } else {
      cb(new Error("Only image/video/pdf files are allowed"));
    }
  },
});


tipRouter.get("/:person_id", async (req, res) => {          //Gets tips for a specific case
  try {
    const { person_id } = req.params;
    const tips = await pool.query(
      `SELECT tips.*, users.name AS tipper 
       FROM tips 
       LEFT JOIN users ON tips.user_id = users.user_id 
       WHERE person_id = $1 
       ORDER BY created_at DESC`,
      [person_id]
    );
    res.json(tips.rows);
  } catch (err) {
    console.error("❌ Error fetching tips:", err.message);
    res.status(500).json({ error: "Server error while fetching tips." });
  }
});


tipRouter.post("/:person_id", authenticateUser, upload.single("evidence"), async (req, res) => {        //People can submit tips with evidence
  try {
    const { person_id } = req.params;
    const tip = req.body.tip?.trim();
    const anonymous = req.body.anonymous;

    if (!tip || tip.length < 3) {
      return res.status(400).json({ error: "Tip must be at least 3 characters long." });
    }

    const isAnonymous = anonymous === "true" || anonymous === "yes";
    const user_id = isAnonymous ? null : req.user.user_id;
    const evidenceUrl = req.file ? `uploads/evidence/${req.file.filename}` : null;

    const result = await pool.query(
      "INSERT INTO tips (person_id, user_id, tip, evidence_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [person_id, user_id, tip, evidenceUrl]
    );

   
    const reporterQuery = await pool.query("SELECT reported_by, name FROM persons WHERE id = $1", [person_id]);
    const reporterId = reporterQuery.rows[0]?.reported_by;
    const caseName = reporterQuery.rows[0]?.name;

    const alertMessageForAdmin = `A new tip was submitted on case #${person_id}`;
    const alertMessageForReporter = `Someone submitted a tip for your reported case.`;
    const alertMessageForPolice = `A new tip was submitted for a case.`;

    
    await pool.query(
      "INSERT INTO alerts (type, message, related_person_id, role_target) VALUES ($1, $2, $3, $4)",       //Tips will be alerted to admins through email
      ["tip", alertMessageForAdmin, person_id, "admin"]
    );

    
    await pool.query(
      "INSERT INTO alerts (type, message, related_person_id, role_target) VALUES ($1, $2, $3, $4)",     //Tips will be alerted to admins through email
      ["tip", alertMessageForPolice, person_id, "police"]
    );

  
    if (reporterId) {
      await pool.query(
        "INSERT INTO alerts (type, message, related_person_id, user_target) VALUES ($1, $2, $3, $4)",   //Tips will be alerted to admins through email
        ["tip", alertMessageForReporter, person_id, reporterId]
      );
    }

    await sendCaseNotification({
      personId: parseInt(person_id),
      caseName: caseName || "Unnamed Case",
      updateType: "tip",
      detail: `A new tip was submitted: \"${tip}\"`,
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("💥 Tip submission failed:", err.message);
    res.status(500).json({ error: "Server error while submitting tip." });
  }
});

module.exports = tipRouter;
