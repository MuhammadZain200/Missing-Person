import React, { useEffect, useState } from "react";
import axios from "axios";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/alerts");
        setAlerts(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch alerts:", error);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">🔔 Real-Time Alerts</h1>

      {alerts.length === 0 ? (
        <p className="text-gray-600 text-center">No alerts available at the moment.</p>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white p-4 rounded-lg shadow flex items-start gap-4 border-l-4 border-blue-600"
            >
              <div className="text-blue-600 text-xl mt-1">⚠️</div>
              <div>
                <p className="font-medium text-gray-800">{alert.message}</p>
                <p className="text-sm text-gray-500">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
