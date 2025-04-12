import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingEmail");
    const storedUser = localStorage.getItem("pendingUser");

    if (!storedEmail || !storedUser) {
      navigate("/login");
    } else {
      setEmail(storedEmail);
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleVerifyOTP = async () => {
    try {
      setError("");

      if (!otp || !email) {
        setError("Missing OTP or email");
        return;
      }

      console.log("🔍 Verifying OTP for:", email, "OTP entered:", otp);

      const res = await axios.post("http://localhost:5000/verify-login-otp", {
        email,
        otp: otp.toString().trim(),
      });

      const { token, role, user } = res.data;

      // Finalize login
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", role);
      localStorage.removeItem("pendingEmail");
      localStorage.removeItem("pendingUser");

      switch (role) {
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
      console.error("❌ OTP verification failed:", err);
      setError(err.response?.data?.error || "OTP verification failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Verify Your OTP</h2>

      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handleVerifyOTP}
        className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
      >
        Verify OTP
      </button>
    </div>
  );
};

export default OTPVerification;
