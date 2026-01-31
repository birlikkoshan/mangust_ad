import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, notifyAuthChanged } from "../api/Admin/client";

const UserNavbar = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isAuthenticated = !!localStorage.getItem("access_token");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    notifyAuthChanged();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div>
          <Link to={isAuthenticated ? "/profile" : "/"}>Mangust AD</Link>
        </div>
        <div>
          {isAuthenticated ? (
            <>
              <Link to="/profile">{user?.name || user?.email || "Profile"}</Link>
              <button className="btn btn-primary" style={{ marginLeft: "10px" }} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
