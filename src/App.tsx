import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminNavbar from './components/AdminNavbar';
import UserNavbar from './components/UserNavbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Stats from './pages/Stats';
import AddAdmin from './pages/AddAdmin';
import './App.css';

type Role = 'admin' | 'user' | null;

const readAuth = (): { isAuthenticated: boolean; role: Role } => {
  const access_token = localStorage.getItem('access_token');
  let role: Role = null;

  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw) as { role?: string };
      if (parsed.role === 'admin' || parsed.role === 'user') {
        role = parsed.role;
      }
    }
  } catch {
    role = null;
  }

  return {
    isAuthenticated: !!access_token,
    role,
  };
};

function App() {
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role: Role }>(() => readAuth());

  useEffect(() => {
    const handleAuthChanged = () => {
      setAuth(readAuth());
    };

    window.addEventListener('auth-changed', handleAuthChanged);
    window.addEventListener('storage', handleAuthChanged);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
      window.removeEventListener('storage', handleAuthChanged);
    };
  }, []);

  const { isAuthenticated, role } = auth;
  const isAdmin = isAuthenticated && role === 'admin';

  return (
    <Router>
      <div className="App">
        {isAdmin ? <AdminNavbar /> : <UserNavbar />}
        <div className="container">
          <Routes>
            {/* Auth routes (visible for everyone) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin-only routes */}
            <Route
              path="/products"
              element={isAdmin ? <Products /> : <Navigate to="/login" />}
            />
            <Route
              path="/products/:id"
              element={isAdmin ? <ProductDetail /> : <Navigate to="/login" />}
            />
            <Route
              path="/categories"
              element={isAdmin ? <Categories /> : <Navigate to="/login" />}
            />
            <Route
              path="/orders"
              element={isAdmin ? <Orders /> : <Navigate to="/login" />}
            />
            <Route
              path="/stats"
              element={isAdmin ? <Stats /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/add"
              element={isAdmin ? <AddAdmin /> : <Navigate to="/login" />}
            />

            {/* Default routes */}
            {/* <Route path="/" element={<Navigate to="/login" />} /> */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
