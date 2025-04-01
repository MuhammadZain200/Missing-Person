import React, { useState, useEffect } from "react";
import axios from "axios";
import LocationPicker from "../../components/LocationPicker";

const ReportMissing = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    last_seen: "",
    last_seen_lat: null,
    last_seen_lng: null,
    date: "",
    image: null,
    additional_info: "",
  });

  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ⬇️ Better geolocation via Nominatim with enhanced parameters
  useEffect(() => {
    const fetchCoords = async () => {
      if (!formData.last_seen || formData.last_seen.length < 3) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            formData.last_seen
          )}&limit=1&addressdetails=1`
        );
        const data = await res.json();
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            setFormData((prev) => ({
              ...prev,
              last_seen_lat: lat,
              last_seen_lng: lng,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to auto-fetch coordinates:", err);
      }
    };

    fetchCoords();
  }, [formData.last_seen]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        setFormData((prev) => ({ ...prev, image: file }));
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.name || formData.name.length < 3) return "Name must be at least 3 characters.";
    if (!formData.age || isNaN(formData.age) || formData.age <= 0) return "Enter a valid age.";
    if (!formData.last_seen) return "Last seen location is required.";
    if (!formData.date) return "Date is required.";
    if (
      formData.last_seen_lat === null ||
      formData.last_seen_lng === null ||
      isNaN(formData.last_seen_lat) ||
      isNaN(formData.last_seen_lng)
    ) {
      return "Coordinates must be valid numbers.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      data.append("name", formData.name);
      data.append("age", formData.age);
      data.append("status", "Missing");
      data.append("last_seen", formData.last_seen);
      data.append("last_seen_lat", formData.last_seen_lat);
      data.append("last_seen_lng", formData.last_seen_lng);
      data.append("date", formData.date);
      data.append("additional_info", formData.additional_info);
      if (formData.image) {
        data.append("image", formData.image);
      }

      await axios.post("http://localhost:5000/persons", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("✅ Report submitted successfully!");
      setFormData({
        name: "",
        age: "",
        last_seen: "",
        last_seen_lat: null,
        last_seen_lng: null,
        date: "",
        image: null,
        additional_info: "",
      });
      setPreview(null);
    } catch (err) {
      console.error("❌ Submission failed:", err.response?.data || err.message);
      const msg = err.response?.data?.error || err.response?.data?.message || "Something went wrong";
      setError(`❌ ${msg}`);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Report Missing Person</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="w-full p-2 border rounded" />
        <input type="text" name="last_seen" placeholder="Last Seen Location (e.g. Oxford Street, London)" value={formData.last_seen} onChange={handleChange} className="w-full p-2 border rounded" />

        <LocationPicker
          lat={formData.last_seen_lat}
          lng={formData.last_seen_lng}
          onSelect={({ lat, lng }) =>
            setFormData((prev) => ({
              ...prev,
              last_seen_lat: parseFloat(lat),
              last_seen_lng: parseFloat(lng),
            }))
          }
        />

        {typeof formData.last_seen_lat === "number" &&
          typeof formData.last_seen_lng === "number" && (
            <p className="text-sm text-gray-600">
              Selected Coordinates: {formData.last_seen_lat.toFixed(5)}, {formData.last_seen_lng.toFixed(5)}
            </p>
          )}

        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 border rounded" />
        <textarea name="additional_info" value={formData.additional_info} onChange={handleChange} placeholder="Additional Info" className="w-full p-2 border rounded h-28" />
        <input type="file" name="image" accept="image/*" onChange={handleChange} className="w-full border p-2 rounded" />
        {preview && <img src={preview} alt="Preview" className="h-40 object-cover mt-2 border rounded" />}
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportMissing;
