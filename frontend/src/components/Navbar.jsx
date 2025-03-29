import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState("");

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));

    // Fetch role from stored user data
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role) {
      setRole(user.role);
    }
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

      <div className="space-x-4">
        {isLoggedIn ? (
          <>
            {/* Role-based Dashboard Link */}
            {role === "admin" ? (
              <Link to="/admin/dashboard">Admin Dashboard</Link>
            ) : (
              <Link to="/user/dashboard">My Dashboard</Link>
            )}

            <Link to="/alerts">Alerts</Link>
            <Link to="/ai-search">AI Search</Link>
            <Link to="/report">Report</Link>
            <Link to="/reports">View Reports</Link>
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
