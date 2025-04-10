import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // ✅ Import Link

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/login", formData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "police":
          navigate("/police/dashboard");
          break;
        case "volunteer":
          navigate("/volunteer/dashboard");
          break;
        default:
          navigate("/user/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-20">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      {/* ✅ Link to Register */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link to="/register" replace className="text-blue-600 hover:underline font-medium">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default Login;
