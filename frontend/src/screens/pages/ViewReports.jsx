import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import MiniMap from "../../components/MiniMap";

const ViewReports = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role");
        setRole(userRole);

        const response = await axios.get("http://localhost:5000/persons", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setReports(response.data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError("Failed to load reports.");
      }
    };

    fetchReports();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/persons/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("❌ Failed to update status. Please try again.");
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.last_seen?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" ? true : report.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6">Submitted Reports</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 border px-3 py-2 rounded"
        />

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="All">All</option>
            <option value="Missing">Missing</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <p className="text-gray-600">No matching reports found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <div key={report.id}>
              <Link
                to={`/case/${report.id}`}
                className="block bg-white border rounded shadow p-4 space-y-2 hover:shadow-lg transition"
              >
                {report.image && (
                  <img
                    src={`http://localhost:5000/uploads/${report.image}`}
                    alt={report.name}
                    className="h-48 w-full object-cover rounded mb-2"
                  />
                )}

                <h3 className="text-xl font-semibold">{report.name}</h3>
                <p className="text-gray-600 text-sm">Age: {report.age}</p>
                <p className="text-gray-600 text-sm">
                  Last Seen: {report.last_seen || "Unknown"}
                </p>

                {report.last_seen_lat && report.last_seen_lng && (
                  <MiniMap
                    lat={report.last_seen_lat}
                    lng={report.last_seen_lng}
                    label={report.last_seen}
                  />
                )}

                <p className="text-gray-600 text-sm">Date: {report.date}</p>

                <span
                  className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    report.status === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : report.status === "Under Investigation"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {report.status || "Unknown"}
                </span>
              </Link>

              {role === "admin" && (
                <div className="mt-3">
                  <label className="text-sm font-medium">Update Status:</label>
                  <select
                    value={report.status || "Missing"}
                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value="Missing">Missing</option>
                    <option value="Under Investigation">Under Investigation</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewReports;
