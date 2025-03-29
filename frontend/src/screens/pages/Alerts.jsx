import React, { useEffect, useState } from "react";
import axios from "axios";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");

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
      console.error("❌ Failed to fetch alerts:", err);
      setError("❌ Failed to load alerts.");
    }
  };

  useEffect(() => {
    fetchAlerts();
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

      // Re-fetch alerts to reflect updated status
      fetchAlerts();
    } catch (err) {
      console.error("❌ Failed to mark as resolved:", err);
      alert("Failed to mark as resolved.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Live Alerts</h1>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {alerts.length === 0 ? (
        <p className="text-center text-gray-600">No alerts available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg shadow p-5 border-l-4 ${
                alert.type === "resolved" ? "border-green-500" : "border-red-500"
              } bg-white transition hover:shadow-md`}
            >
              <h2 className="text-xl font-semibold">{alert.message}</h2>
              <p className="text-sm text-gray-600">
                Alert Type: <span className="font-medium">{alert.type}</span>
              </p>
              <p className="text-sm text-gray-600">
                Date: {new Date(alert.created_at).toLocaleString()}
              </p>

              {alert.type !== "resolved" && (
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
