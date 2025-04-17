import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./screens/pages/Home";
import CaseDetails from "./screens/pages/CaseDetails";
import AISearch from "./screens/pages/AISearch";
import Alerts from "./screens/pages/Alerts";
import ReportMissing from "./screens/pages/ReportMissing";
import ViewReports from "./screens/pages/ViewReports";
import Login from "./screens/pages/Login";
import Register from "./screens/pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import PoliceDashboard from "./components/PoliceDashboard";
import VolunteerDashboard from "./components/VolunteerDashboard";
import ManageUsers from "./components/ManageUsers";
import AdminRoute from "./components/AdminRoute";
import OTPVerification from "./components/OTPVerification";
import Profile from "./screens/pages/Profile"; // 

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <PublicRoute>
              <OTPVerification />
            </PublicRoute>
          }
        />

        {/* Protected Routes with Navbar and Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/case/:id"
            element={
              <PrivateRoute>
                <CaseDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/ai-search"
            element={
              <PrivateRoute>
                <AISearch />
              </PrivateRoute>
            }
          />
          <Route
            path="/alerts"
            element={
              <PrivateRoute>
                <Alerts />
              </PrivateRoute>
            }
          />
          <Route
            path="/report"
            element={
              <PrivateRoute>
                <ReportMissing />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <ViewReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/user/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/police/dashboard"
            element={
              <PrivateRoute>
                <PoliceDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/volunteer/dashboard"
            element={
              <PrivateRoute>
                <VolunteerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile" // 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
