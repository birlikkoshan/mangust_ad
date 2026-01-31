import { Link, useNavigate } from "react-router-dom";
import { notifyAuthChanged } from "../../api/Admin/client";

const UserNavbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("access_token");

  let user: { name?: string; email?: string; role?: string } = {};
  try {
    const raw = localStorage.getItem("user");
    if (raw) user = JSON.parse(raw);
  } catch {
    user = {};
  }

  const isAdmin = user.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    notifyAuthChanged();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="container">
          <div>
            <Link to="/">Mangust AD</Link>
          </div>
          <div>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </nav>
    );
  }

  if (isAdmin) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div>
          <Link to="/shop">Mangust AD</Link>
          <Link to="/shop">Products</Link>
          <Link to="/shop/orders">Orders</Link>
          <Link to="/shop/wishlist">Wishlist</Link>
          <Link to="/shop/profile">Profile</Link>
        </div>
        <div>
          <span style={{ marginRight: "10px" }}>{user.name || user.email}</span>
          <button className="btn btn-primary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
