import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🟢 Fetching report ID:", id);
        console.log("🛡 Token:", token);
  
        const response = await axios.get(`http://localhost:5000/persons/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        console.log("📥 Response Data:", response.data);
  
        if (response.data && response.data.id) {
          setReport(response.data);
        } else {
          console.log("⚠️ Invalid response format:", response.data);
          setError("⚠️ Report not found or invalid response.");
        }
      } catch (err) {
        console.error("❌ Failed to load report:", err);
        if (err.response) {
          console.error("📛 Server response:", err.response.status, err.response.data);
        }
        setError("❌ Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchReport();
  }, [id]);
  

  if (loading) return <p className="p-6">Loading report...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!report) return <p className="p-6 text-gray-600">No report data available.</p>;

  const formattedDate = report.date ? new Date(report.date).toLocaleDateString() : "Not provided";

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">{report.name || "Unnamed Report"}</h2>
        <button
          onClick={() => navigate("/reports")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Reports
        </button>
      </div>

      {report.image && (
        <img
          src={`http://localhost:5000/uploads/${report.image}`}
          alt={report.name}
          className="w-full h-80 object-cover rounded mb-4"
        />
      )}

      <div className="space-y-2 text-gray-700 text-sm">
        <p><strong>Age:</strong> {report.age || "Not provided"}</p>
        <p><strong>Status:</strong>{" "}
          <span className={`px-2 py-1 rounded text-white text-xs font-semibold ${
            report.status === "Resolved" ? "bg-green-600" : "bg-yellow-500"
          }`}>
            {report.status}
          </span>
        </p>
        <p><strong>Last Seen:</strong> {report.last_seen || "Not provided"}</p>
        <p><strong>Date:</strong> {formattedDate}</p>
        <p><strong>Reported By:</strong> {report.reported_by_name || "Anonymous"}</p>
        {report.additional_info && (
          <p><strong>Additional Info:</strong> {report.additional_info}</p>
        )}
      </div>
    </div>
  );
};

export default CaseDetails;
