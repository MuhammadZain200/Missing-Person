import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./screens/pages/Home";
import CaseDetails from "./screens/pages/CaseDetails";
import AISearch from "./screens/pages/AISearch";
import Alerts from "./screens/pages/Alerts";
import ReportMissing from "./screens/pages/ReportMissing";
import Login from "./screens/pages/Login";
import Register from "./screens/pages/Register";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import "./index.css";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {!hideNavbar && <Navbar />}
      <main className="p-6 pt-24">{children}</main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/case/:id" element={<PrivateRoute><CaseDetails /></PrivateRoute>} />
          <Route path="/ai-search" element={<PrivateRoute><AISearch /></PrivateRoute>} />
          <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><ReportMissing /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
