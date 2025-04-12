import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState("");
  const [unseenCount, setUnseenCount] = useState(0); // 🔔 unseen alerts

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));

    // Fetch role from stored user data
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role) {
      setRole(user.role);
    }
  }, [location]);

  useEffect(() => {
    // Fetch unseen alert count every 15s
    const fetchUnseenCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:5000/alerts/unseen-count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUnseenCount(res.data.unseenCount);
      } catch (err) {
        console.error("Failed to fetch unseen alert count:", err);
      }
    };

    fetchUnseenCount(); // Initial load
    const interval = setInterval(fetchUnseenCount, 15000); // Every 15 seconds
    return () => clearInterval(interval); // Cleanup
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow z-50 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        Missing Persons DB
      </Link>

      <div className="space-x-4 flex items-center">
        {isLoggedIn ? (
          <>
            {/* Role-based Dashboard Link */}
            {role === "admin" ? (
              <Link to="/admin/dashboard">Admin Dashboard</Link>
            ) : role === "police" ? (
              <Link to="/police/dashboard">Police Dashboard</Link>
            ) : role === "volunteer" ? (
              <Link to="/volunteer/dashboard">Volunteer Dashboard</Link>
            ) : (
              <Link to="/user/dashboard">My Dashboard</Link>
            )}

            <Link to="/alerts" className="relative text-xl">
              Alert
              {unseenCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unseenCount}
                </span>
              )}
            </Link>

            <Link to="/ai-search">AI Search</Link>
            <Link to="/report">Report</Link>
            <Link to="/reports">View Reports</Link>

            {/* ✅ New: My Profile Link */}
            <Link to="/profile" className="font-medium hover:underline">
              My Profile
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
