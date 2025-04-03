import React, { useEffect, useState } from "react";
import axios from "axios";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all"); // Alert type filter
  const [role, setRole] = useState(""); // User role

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/alerts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlerts(response.data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      setError("Failed to load alerts.");
    }
  };

  useEffect(() => {
    fetchAlerts(); // Initial fetch
    const interval = setInterval(fetchAlerts, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role) {
      setRole(user.role);
    }
  }, []);

  const markAsResolved = async (personId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/persons/${personId}/status`,
        { status: "Resolved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchAlerts(); // Refresh alerts after update
    } catch (err) {
      console.error("Failed to mark as resolved:", err);
      alert("Failed to mark as resolved.");
    }
  };

  const markAlertAsSeen = async (alertId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/alerts/${alertId}/seen`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAlerts(); // Refresh alerts list after marking as seen
    } catch (err) {
      console.error("Failed to mark alert as seen:", err);
    }
  };

  // Filter alerts by type
  const filteredAlerts = alerts.filter((alert) =>
    filterType === "all" ? true : alert.type === filterType
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Live Alerts</h1>

      {/* Filter Dropdown */}
      <div className="mb-6 text-center">
        <label className="mr-4 font-medium">Filter by type:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="new_tip">Tips</option>
          <option value="status">Status Updates</option>
          <option value="new_case">New Reports</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {filteredAlerts.length === 0 ? (
        <p className="text-center text-gray-600">No alerts available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg shadow p-5 border-l-4 ${
                alert.type === "resolved" ? "border-green-500" : "border-red-500"
              } bg-white transition hover:shadow-md`}
            >
              <h2 className="text-xl font-semibold">{alert.message}</h2>
              <p className="text-sm text-gray-600">
                Alert Type:{" "}
                <span className="font-medium">
                  {alert.type
                    ?.replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase()) || "General"}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Date: {new Date(alert.created_at).toLocaleString()}
              </p>

              {/* Show who this alert is for */}
              <div className="mt-2 text-sm text-gray-500">
                {alert.role_target && (
                  <p>
                    👥 Role Target:{" "}
                    <span className="font-medium">{alert.role_target}</span>
                  </p>
                )}
                {alert.user_target && <p>👤 Personal Alert</p>}
              </div>

              {/* Seen/unseen toggle */}
              {!alert.seen ? (
                <button
                  onClick={() => markAlertAsSeen(alert.id)}
                  className="mt-3 py-1 px-3 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark as Read
                </button>
              ) : (
                <p className="mt-3 text-xs text-gray-400">✅ Seen</p>
              )}

              {/* Only admins see this */}
              {role === "admin" &&
                alert.type !== "resolved" &&
                alert.related_person_id && (
                  <button
                    onClick={() => markAsResolved(alert.related_person_id)}
                    className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Mark as Resolved
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
