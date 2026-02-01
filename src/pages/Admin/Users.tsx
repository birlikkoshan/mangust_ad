import { useState, useEffect } from "react";
import { usersAPI, AdminUser } from "../../api/Admin/users";

const Users = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await usersAPI.getAllAdmin();
      setUsers(result.items);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Users</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td>{user.name || "—"}</td>
                <td>{user.email || "—"}</td>
                <td>{user.role || "—"}</td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users?.length === 0 && !loading && (
          <div style={{ padding: "16px", color: "#666" }}>No users found.</div>
        )}
      </div>
    </div>
  );
};

export default Users;
