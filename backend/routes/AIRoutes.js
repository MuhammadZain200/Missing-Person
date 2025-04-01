const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const router = express.Router();                             // It handles request to speicific routes
const upload = multer({ dest: "uploads/" });                //Saves the files that have been uploaded temporarely





router.post("/ai-search", upload.single("file"), async (req, res) => {              // Sents a request to "ai-search" to upload pictures.
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });                   //Checks if the file has been uploaded or not.
    }
  
    const imagePath = path.join(__dirname, "..", req.file.path);              //Goes to the "file.path"  in this case uploads
  
    //Console logs start here
    console.log("File uploaded:", req.file.filename);
    console.log("Will forward to Python:", imagePath);
  
    try {
      const formData = new FormData();
      formData.append("file", fs.createReadStream(imagePath));        //Adds the pictture to the image path, so it can be sent to the pythong server.
  
      console.log("Sending to Python with headers:", formData.getHeaders());
  
      const response = await axios.post("http://localhost:5001/match-face", formData, {
        headers: formData.getHeaders()                              //Sends images to match-face (Python Flask API)
      });
  
      console.log("Response from Python:", response.data);
  
      fs.unlinkSync(imagePath);                             //Prints the result, deletes the uploaded image and then gives a result.
  
      res.json(response.data);
    } catch (err) {
      console.error("AI Search Error:", err.message);
      res.status(500).json({ error: "Face match failed", details: err.message });
    }
  });
  
  module.exports = router;
