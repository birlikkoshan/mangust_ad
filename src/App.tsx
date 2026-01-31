import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminNavbar from './components/Admin/AdminNavbar';
import UserNavbar from './components/User/UserNavbar';
import Login from './pages/Login';
import Register from './pages/Admin/Register';
import Products from './pages/Admin/Products';
import ProductDetail from './pages/Admin/ProductDetail';
import Categories from './pages/Admin/Categories';
import Orders from './pages/Admin/Orders';
import OrderDetail from './pages/Admin/OrderDetail';
import Stats from './pages/Admin/Stats';
import AddAdmin from './pages/Admin/AddAdmin';
import UserProductCatalog from './pages/User/ProductCatalog';
import UserProductDetail from './pages/User/ProductDetail';
import UserOrderList from './pages/User/OrderList';
import UserOrderDetail from './pages/User/OrderDetail';
import UserCreateOrder from './pages/User/CreateOrder';
import UserWishlist from './pages/User/Wishlist';
import UserProfile from './pages/User/Profile';
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
              path="/orders/:id"
              element={isAdmin ? <OrderDetail /> : <Navigate to="/login" />}
            />
            <Route
              path="/stats"
              element={isAdmin ? <Stats /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/add"
              element={isAdmin ? <AddAdmin /> : <Navigate to="/login" />}
            />

            {/* User (non-admin) routes */}
            <Route
              path="/shop"
              element={isAuthenticated ? <UserProductCatalog /> : <Navigate to="/login" />}
            />
            <Route
              path="/shop/products/:id"
              element={isAuthenticated ? <UserProductDetail /> : <Navigate to="/login" />}
            />
            <Route
              path="/shop/orders"
              element={isAuthenticated ? <UserOrderList /> : <Navigate to="/login" />}
            />
            <Route
              path="/shop/orders/new"
              element={isAuthenticated ? <UserCreateOrder /> : <Navigate to="/login" />}
            />
            <Route
              path="/shop/orders/:id"
              element={isAuthenticated ? <UserOrderDetail /> : <Navigate to="/login" />}
            />
            <Route
              path="/shop/wishlist"
              element={isAuthenticated ? <UserWishlist /> : <Navigate to="/login" />}
            />
            <Route
              path="/shop/profile"
              element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />}
            />

            {/* Default routes */}
            <Route path="/" element={<Navigate to={isAuthenticated ? (isAdmin ? '/products' : '/shop') : '/login'} replace />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? (isAdmin ? '/products' : '/shop') : '/login'} replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
