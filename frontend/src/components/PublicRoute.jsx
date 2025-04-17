//Prevents user who are already logged-in to no redirect them to login / register page
// If not logged-in, then it'll redirect to login / register page

import React from "react";
import { Navigate } from "react-router-dom";

const isAuthenticated = () => !!localStorage.getItem("token"); 

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

export default PublicRoute;
