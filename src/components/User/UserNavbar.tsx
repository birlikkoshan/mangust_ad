import { Link, useNavigate } from "react-router-dom";
import { notifyAuthChanged } from "../../api/Admin/client";

const iconHome = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const iconCatalog = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const iconOrders = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const iconWishlist = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const iconProfile = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const iconLogout = (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

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
          <Link to="/shop" className="user-nav-brand">{iconHome} Mangust AD</Link>
          <Link to="/shop/catalog">{iconCatalog} Catalog</Link>
          <Link to="/shop/orders">{iconOrders} Orders</Link>
          <Link to="/shop/wishlist">{iconWishlist} Wishlist</Link>
          <Link to="/shop/profile">{iconProfile} Profile</Link>
        </div>
        <div className="user-nav-links">
          <span style={{ marginRight: "12px", fontSize: "14px", opacity: 0.9 }}>{user.name || user.email}</span>
          <button className="user-btn user-btn-primary" onClick={handleLogout} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            {iconLogout} Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
