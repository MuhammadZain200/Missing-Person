// Manages and adjust roles for each account accessible by admins only
//Displays accounts in a table witha  drop down menu to change their roles.

import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Could not load users.");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("✅ Role updated successfully.");
      fetchUsers();
    } catch (err) {
      console.error("Role update failed:", err);
      setError("Failed to update role.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-700">Manage User Roles</h1>
      {message && <p className="text-green-600 text-center mb-2">{message}</p>}
      {error && <p className="text-red-600 text-center mb-2">{error}</p>}
      <div className="overflow-x-auto mt-6">
        <table className="min-w-full bg-white border rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Current Role</th>
              <th className="p-3 text-left">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id} className="border-t">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 capitalize">{user.role}</td>
                <td className="p-3">
                  <select
                    className="p-2 border rounded"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="police">Police</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
