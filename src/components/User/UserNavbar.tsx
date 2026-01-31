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
      <nav className="user-navbar">
        <div className="user-nav-inner">
          <Link to="/" className="user-nav-brand">Mangust AD</Link>
          <div className="user-nav-links">
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
    <nav className="user-navbar">
      <div className="user-nav-inner">
        <div className="user-nav-links">
          <Link to="/shop" className="user-nav-brand">Mangust AD</Link>
          <Link to="/shop/catalog">Catalog</Link>
          <Link to="/shop/orders">Orders</Link>
          <Link to="/shop/wishlist">Wishlist</Link>
          <Link to="/shop/profile">Profile</Link>
        </div>
        <div className="user-nav-links">
          <span style={{ marginRight: "12px", fontSize: "14px", opacity: 0.9 }}>{user.name || user.email}</span>
          <button className="user-btn user-btn-primary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
