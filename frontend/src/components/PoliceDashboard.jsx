import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const PoliceDashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    missingReports: 0,
    recentReports: [],
  });

  const [chartData, setChartData] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/persons", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allReports = response.data.sort(
          (a, b) => new Date(b.updated_at || b.date) - new Date(a.updated_at || a.date)
        );

        const resolved = allReports.filter((r) => r.status === "Resolved").length;
        const missing = allReports.filter((r) => r.status === "Missing").length;

        const chartMap = {};
        allReports.forEach((r) => {
          const date = new Date(r.date).toLocaleDateString();
          chartMap[date] = (chartMap[date] || 0) + 1;
        });

        const chartArray = Object.entries(chartMap).map(([date, count]) => ({
          date,
          count,
        }));

        setStats({
          totalReports: allReports.length,
          resolvedReports: resolved,
          missingReports: missing,
          recentReports: allReports.slice(0, 5),
        });
        setChartData(chartArray);
        setFilteredReports(allReports);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load data.");
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    let reports = stats.recentReports;

    if (selectedStatus !== "all") {
      reports = reports.filter((r) => r.status === selectedStatus);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.status.toLowerCase().includes(term) ||
          (r.last_seen && r.last_seen.toLowerCase().includes(term))
      );
    }

    setFilteredReports(reports);
  }, [selectedStatus, searchTerm, stats]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">Police Dashboard</h1>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow p-5 rounded text-center">
          <h3 className="text-lg font-medium">Total Reports</h3>
          <p className="text-4xl text-blue-600 font-bold mt-2">{stats.totalReports}</p>
        </div>
        <div className="bg-white shadow p-5 rounded text-center">
          <h3 className="text-lg font-medium">Missing Cases</h3>
          <p className="text-4xl text-yellow-500 font-bold mt-2">{stats.missingReports}</p>
        </div>
        <div className="bg-white shadow p-5 rounded text-center">
          <h3 className="text-lg font-medium">Resolved Cases</h3>
          <p className="text-4xl text-green-600 font-bold mt-2">{stats.resolvedReports}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow p-6 rounded mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Reports Over Time</h2>
        {chartData.length === 0 ? (
          <p className="text-gray-500">No chart data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow p-6 rounded">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Cases</h2>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-1"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="all">All</option>
              <option value="Missing">Missing</option>
              <option value="Resolved">Resolved</option>
              <option value="Under Investigation">Under Investigation</option>
            </select>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <p className="text-gray-500">No recent cases found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredReports.map((report) => (
              <li key={report.id} className="py-4">
                <div className="flex justify-between items-center">
                  <span
                    onClick={() => navigate(`/case/${report.id}`)}
                    className="font-medium text-lg text-blue-700 cursor-pointer hover:underline"
                  >
                    {report.name}
                  </span>
                  <button
                    onClick={() => navigate(`/case/${report.id}`)}
                    className="ml-4 px-4 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                  >
                    View Tips
                  </button>
                </div>
                <p className="text-sm text-gray-500">Status: {report.status}</p>
                <p className="text-sm text-gray-500">Last Seen: {report.last_seen}</p>
                <p className="text-xs text-gray-400">
                  Updated: {new Date(report.updated_at || report.date).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PoliceDashboard;
