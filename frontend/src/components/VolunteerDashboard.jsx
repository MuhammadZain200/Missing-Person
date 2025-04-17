//Dashboard view for Volunteers to view and help with reported cases

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VolunteerDashboard = () => {
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/persons", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const sorted = res.data.sort(
          (a, b) => new Date(b.updated_at || b.date) - new Date(a.updated_at || a.date)
        );

        setReports(sorted);
        setFiltered(sorted);
      } catch (err) {
        console.error("Volunteer fetch error:", err);
        setError("Failed to load reports.");
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    if (selectedStatus === "all") {
      setFiltered(reports);
    } else {
      setFiltered(reports.filter((r) => r.status === selectedStatus));
    }
  }, [selectedStatus, reports]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-purple-700 mb-10">Volunteer Dashboard</h1>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <div className="flex justify-end mb-4">
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

      {filtered.length === 0 ? (
        <p className="text-center text-gray-500">No reports found.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((report) => (
            <li
              key={report.id}
              className="bg-white shadow rounded p-5 hover:shadow-md transition"
            >
              <h3
                onClick={() => navigate(`/case/${report.id}`)}
                className="text-lg font-semibold text-blue-700 cursor-pointer hover:underline"
              >
                {report.name}
              </h3>
              <p className="text-sm text-gray-600">Age: {report.age}</p>
              <p className="text-sm text-gray-600">Last Seen: {report.last_seen}</p>
              <p className="text-sm text-gray-600">Date: {report.date}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                  report.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : report.status === "Under Investigation"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {report.status}
              </span>
              <button
                onClick={() => navigate(`/case/${report.id}`)}
                className="mt-4 w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                View & Submit Tip
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VolunteerDashboard;
