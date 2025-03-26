import React, { useState, useEffect } from "react";
import axios from "axios";

const ReportMissing = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    status: "Missing",
    reported_by: "",
    last_seen: "",
    date: ""
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.username) {
      setFormData(prev => ({ ...prev, reported_by: user.username }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔎 Debug: log what’s being sent
    console.log("📤 Sending to backend:", formData);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post("http://localhost:5000/persons", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage("✅ Report submitted successfully!");
      console.log("✅ Backend response:", response.data);

      // Reset the form
      setFormData(prev => ({
        name: "",
        age: "",
        status: "Missing",
        reported_by: prev.reported_by,
        last_seen: "",
        date: ""
      }));
    } catch (error) {
      console.error("❌ Submission failed:", error);
      setMessage("❌ Failed to submit report.");
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Report Missing Person</h2>

      {message && <p className="mb-4 text-blue-700">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="last_seen"
          placeholder="Last Seen Location"
          value={formData.last_seen}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        {/* Hidden system-controlled fields */}
        <input type="hidden" name="status" value={formData.status} />
        <input type="hidden" name="reported_by" value={formData.reported_by} />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
};

export default ReportMissing;
