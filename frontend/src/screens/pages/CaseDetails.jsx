import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MapLocation from "../../components/MapLocation";

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [role, setRole] = useState("");
  const [tips, setTips] = useState([]);
  const [newTip, setNewTip] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [evidence, setEvidence] = useState(null);
  const [tipError, setTipError] = useState("");
  const [tipMessage, setTipMessage] = useState("");

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const userRole = user?.role;
      setRole(userRole);

      const response = await axios.get(`http://localhost:5000/persons/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.id) {
        setReport(response.data);
      } else {
        setError("Report not found or invalid response.");
      }
    } catch (err) {
      console.error("Failed to load report:", err);
      setError("Failed to load report.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTips = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/tips/${id}`);
      setTips(response.data);
    } catch (err) {
      console.error("Failed to fetch tips:", err);
    }
  };

  useEffect(() => {
    fetchReport();
    fetchTips();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
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
      await fetchReport();
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Status update failed.");
    } finally {
      setUpdating(false);
    }
  };

  const handleTipSubmit = async () => {
    setTipError("");
    setTipMessage("");

    if (newTip.trim().length < 3) {
      setTipError("Tip must be at least 3 characters.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("tip", newTip.trim());
      formData.append("anonymous", anonymous ? "yes" : "no");
      if (evidence) {
        formData.append("evidence", evidence);
      }

      await axios.post(`http://localhost:5000/tips/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setNewTip("");
      setEvidence(null);
      setTipMessage("✅ Tip submitted!");
      fetchTips();
    } catch (err) {
      console.error("Tip submission failed:", err.response?.data || err.message);
      setTipError(`❌ ${err.response?.data?.error || "Failed to submit tip."}`);
    }
  };

  if (loading) return <p className="p-6">Loading report...</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (!report) return <p className="p-6 text-gray-600">No report data available.</p>;

  const formattedDate = report.date
    ? new Date(report.date).toLocaleDateString()
    : "Not provided";

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
          src={
            report.image.startsWith("http")
              ? report.image
              : `http://localhost:5000/uploads/${report.image}`
          }
          alt={report.name}
          className="w-full h-80 object-cover rounded mb-4"
        />
      )}

      <div className="space-y-2 text-gray-700 text-sm">
        <p><strong>Age:</strong> {report.age || "Not provided"}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-1 rounded text-white text-xs font-semibold ${
              report.status === "Resolved"
                ? "bg-green-600"
                : report.status === "Under Investigation"
                ? "bg-blue-600"
                : "bg-yellow-500"
            }`}
          >
            {report.status}
          </span>
        </p>

        {role === "admin" && (
          <div className="mt-2">
            <label htmlFor="status" className="block text-sm font-medium">
              Update Status:
            </label>
            <select
              id="status"
              className="mt-1 block w-full border p-2 rounded"
              value={report.status || ""}
              onChange={handleStatusChange}
              disabled={updating}
            >
              <option value="Missing">Missing</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        )}

        <p><strong>Last Seen:</strong> {report.last_seen || "Not provided"}</p>
        <p><strong>Date:</strong> {formattedDate}</p>
        <p><strong>Reported By:</strong> {report.reported_by_name || "Anonymous"}</p>
        {report.additional_info && (
          <p><strong>Additional Info:</strong> {report.additional_info}</p>
        )}
      </div>

      {report.last_seen_lat && report.last_seen_lng && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Location on Map</h3>
          <MapLocation
            lat={report.last_seen_lat}
            lng={report.last_seen_lng}
            label={report.last_seen}
          />
        </div>
      )}

      <div className="mt-10">
        <h3 className="text-xl font-bold mb-3">🕵️ Tip Line</h3>

        <div className="space-y-2 mb-4">
          <textarea
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Submit a helpful tip or clue..."
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">Submit anonymously</label>
          </div>

          <input
            type="file"
            onChange={(e) => setEvidence(e.target.files[0])}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border file:rounded file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          <button
            onClick={handleTipSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Tip
          </button>

          {tipError && <p className="text-red-600 text-sm">{tipError}</p>}
          {tipMessage && <p className="text-green-600 text-sm">{tipMessage}</p>}
        </div>

        {tips.length === 0 ? (
          <p className="text-gray-600">No tips submitted yet.</p>
        ) : (
          <ul className="space-y-2">
            {tips.map((tip) => (
              <li key={tip.id} className="border p-3 rounded bg-gray-50">
                <p className="text-sm text-gray-800">{tip.tip}</p>
                {tip.evidence_url && (
                  <p className="text-xs text-blue-600 mt-1">
                    📎 <a href={`http://localhost:5000/${tip.evidence_url}`} target="_blank" rel="noreferrer">View Evidence</a>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  — {tip.tipper || "Anonymous"}, {new Date(tip.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CaseDetails;
