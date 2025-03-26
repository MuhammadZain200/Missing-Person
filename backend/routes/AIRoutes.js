const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const router = express.Router(); // ✅ this line MUST come before router.post()

const upload = multer({ dest: "uploads/" });





router.post("/ai-search", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
  
    const imagePath = path.join(__dirname, "..", req.file.path); // go up one folder
  
    // ✅ Console logs start here
    console.log("📥 File uploaded:", req.file.filename);
    console.log("📤 Will forward to Python:", imagePath);
  
    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(imagePath));
  
      console.log("🧪 Sending to Python with headers:", formData.getHeaders());
  
      const response = await axios.post("http://localhost:5001/match-face", formData, {
        headers: formData.getHeaders()
      });
  
      console.log("✅ Response from Python:", response.data);
  
      fs.unlinkSync(imagePath);
  
      res.json(response.data);
    } catch (err) {
      console.error("❌ AI Search Error:", err.message);
      res.status(500).json({ error: "Face match failed", details: err.message });
    }
  });
  
  module.exports = router;
