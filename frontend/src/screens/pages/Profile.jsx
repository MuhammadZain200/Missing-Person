import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser({ name: storedUser.name, email: storedUser.email });
  }, []);

  const handleChange = (e) => {
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      setMessage("");
      setError("");

      const res = await axios.put(
        "http://localhost:5000/profile",
        { ...user, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Profile updated successfully");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setPassword(""); 
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Update failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>

      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <input
        type="text"
        name="name"
        value={user.name}
        onChange={handleChange}
        placeholder="Full Name"
        className="w-full p-2 border rounded mb-4"
      />
      <input
        type="email"
        name="email"
        value={user.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full p-2 border rounded mb-4"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New Password (optional)"
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleUpdate}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
};

export default Profile;
