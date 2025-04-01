import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    missingReports: 0,
    recentReports: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/persons", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allReports = response.data;
        const resolved = allReports.filter((r) => r.status === "Resolved").length;
        const missing = allReports.filter((r) => r.status === "Missing").length;

        setStats({
          totalReports: allReports.length,
          resolvedReports: resolved,
          missingReports: missing,
          recentReports: allReports.slice(0, 5),
        });
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load dashboard data.");
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-blue-700">Admin Dashboard</h1>

      {error && <p className="text-red-600 text-center mb-6">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow rounded p-6 text-center hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-700">Total Reports</h2>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalReports}</p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-700">Missing Cases</h2>
          <p className="text-4xl font-bold text-yellow-500 mt-2">{stats.missingReports}</p>
        </div>
        <div className="bg-white shadow rounded p-6 text-center hover:shadow-md transition">
          <h2 className="text-lg font-semibold text-gray-700">Resolved Cases</h2>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.resolvedReports}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Reports</h2>
        <ul className="divide-y divide-gray-200">
          {stats.recentReports.map((report) => (
            <li key={report.id} className="py-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700 text-lg">{report.name}</span>
                <span className={`text-sm px-3 py-1 rounded-full font-semibold shadow-sm transition ${{
                  'Resolved': "bg-green-100 text-green-700",
                  'Missing': "bg-yellow-100 text-yellow-700",
                  'Under Investigation': "bg-blue-100 text-blue-700"
                }[report.status]}`}>{report.status}</span>
              </div>
              <p className="text-sm text-gray-500">Last Seen: {report.last_seen}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
