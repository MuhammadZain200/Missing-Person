import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex flex-wrap justify-between items-center w-full shadow-md z-10 fixed top-0 left-0">
      <Link to="/" className="font-bold text-xl">
        Missing Persons DB
      </Link>
      <div className="flex flex-wrap gap-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/alerts" className="hover:underline">Alerts</Link>
        <Link to="/ai-search" className="hover:underline">AI Search</Link>
        <Link to="/report" className="hover:underline">Report</Link>
        <Link to="/login" className="hover:underline">Login</Link>
        <Link to="/register" className="hover:underline">Register</Link>
      </div>
    </nav>
  );
};

export default Navbar;
