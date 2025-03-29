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
            path="/user/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
