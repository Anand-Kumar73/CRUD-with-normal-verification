import { useEffect, useState } from "react";

import axios from "axios";

import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000/api/users";

const Users = () => {
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL, getConfig());

      setUsers(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.assign("/login");
        return;
      }

      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/${editingId}`,
          {
            name,
            email,
            password,
          },
          getConfig(),
        );

        setSuccess("User updated successfully");
      } else {
        await axios.post(
          API_URL,
          {
            name,
            email,
            password,
          },
          getConfig(),
        );

        setSuccess("User created successfully");
      }

      clearForm();
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.assign("/login");
        return;
      }

      setError(error.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);

    setName(user.name);

    setEmail(user.email);

    setPassword("");

    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await axios.delete(`${API_URL}/${id}`, getConfig());

      setSuccess("User deleted successfully");

      fetchUsers();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.assign("/login");
        return;
      }

      setError(error.response?.data?.message || "Failed to delete user");
    }
  };

  const clearForm = () => {
    setEditingId(null);

    setName("");

    setEmail("");

    setPassword("");
  };

  return (
    <>
      <Navbar />

      <div className="container">
        <h1>Users</h1>

        {error && <p className="error">{error}</p>}

        {success && <p className="success">{success}</p>}

        <form className="crud-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Update User" : "Create User"}</h2>

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder={editingId ? "New password (optional)" : "Password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update User" : "Create User"}
          </button>

          {editingId && (
            <button type="button" onClick={clearForm}>
              Cancel
            </button>
          )}
        </form>

        <div className="table-container">
          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>

                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>{new Date(user.created_at).toLocaleDateString()}</td>

                    <td>
                      <button onClick={() => handleEdit(user)}>Edit</button>

                      <button onClick={() => handleDelete(user.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default Users;
