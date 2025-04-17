// Displays login users to their submitted missing person reports

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserReports = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        setError("User not found in local storage.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/persons", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userReports = response.data.filter(
          (report) => report.reported_by === user.user_id
        );

        setReports(userReports);
      } catch (err) {
        console.error("Error loading user reports:", err);
        setError("Failed to load your reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Your Dashboard</h1>

      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-600">Loading your reports...</p>
      ) : reports.length === 0 ? (
        <p className="text-center text-gray-600">You haven't submitted any reports yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Link
              key={report.id}
              to={`/case/${report.id}`}
              className="bg-white border rounded-lg shadow-sm p-5 hover:shadow-md transition block"
            >
              <h3 className="text-xl font-semibold mb-1 text-gray-800">{report.name}</h3>
              <p className="text-sm text-gray-600">Age: {report.age}</p>
              <p className="text-sm text-gray-600">Last Seen: {report.last_seen}</p>
              <p className="text-sm text-gray-600">Date: {new Date(report.date).toLocaleDateString()}</p>
              <span
                className={`inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full ${
                  report.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : report.status === "Under Investigation"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {report.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
