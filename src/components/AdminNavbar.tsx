import { Link, useNavigate } from 'react-router-dom';
import { notifyAuthChanged } from '../api/Admin/client';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');

  let user: { name?: string; email?: string; role?: string } = {};
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      user = JSON.parse(raw);
    }
  } catch {
    user = {};
  }

  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    notifyAuthChanged();
    navigate('/login');
  };

  // Hide navbar completely for non-authenticated users
  if (!isAuthenticated) {
    return null;
  }

  // For non-admin authenticated users, show minimal navbar without admin pages
  if (!isAdmin) {
    return (
      <nav className="navbar">
        <div className="container" style={{ justifyContent: 'space-between' }}>
          <div>
            <Link to="/profile">Mangust AD</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/profile">Profile</Link>
            <span style={{ marginRight: '10px' }}>{user.name || user.email}</span>
            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Full admin navbar
  return (
    <nav className="navbar">
      <div className="container">
        <div>
          <Link to="/products">Mangust AD</Link>
        </div>
        <div>
          <Link to="/products">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/stats">Statistics</Link>
          <Link to="/admin/add">Add admin</Link>
          <Link to="/profile">Profile</Link>
          <span style={{ marginLeft: '20px', marginRight: '10px' }}>
            {user.name || user.email}
          </span>
          <button className="btn btn-primary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
