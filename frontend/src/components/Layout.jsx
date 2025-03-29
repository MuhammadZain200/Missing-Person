import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {!hideNavbar && <Navbar />}
      <main className="p-6 pt-24">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
