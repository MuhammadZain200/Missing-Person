import React from "react";
import { Navigate } from "react-router-dom";

const isAuthenticated = () => !!localStorage.getItem("token"); // or "user"

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

export default PublicRoute;
