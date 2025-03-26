import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-6">
      <ul className="space-y-4">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/report">Report Missing</Link></li>
        <li><Link to="/ai-search">AI Search</Link></li>
        <li><Link to="/alerts">Alerts</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li>
          <button
            onClick={handleLogout}
            className="w-full text-left text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
