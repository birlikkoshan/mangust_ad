import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminSidebar from './components/Admin/AdminSidebar';
import UserNavbar from './components/User/UserNavbar';
import Login from './pages/Login';
import Register from './pages/Admin/Register';
import Products from './pages/Admin/Products';
import ProductDetail from './pages/Admin/ProductDetail';
import Categories from './pages/Admin/Categories';
import Orders from './pages/Admin/Orders';
import OrderDetail from './pages/Admin/OrderDetail';
import Stats from './pages/Admin/Stats';
import Dashboard from './pages/Admin/Dashboard';
import AddAdmin from './pages/Admin/AddAdmin';
import UserMainPage from './pages/User/MainPage';
import UserProductCatalog from './pages/User/ProductCatalog';
import UserProductDetail from './pages/User/ProductDetail';
import UserOrderList from './pages/User/OrderList';
import UserOrderDetail from './pages/User/OrderDetail';
import UserCreateOrder from './pages/User/CreateOrder';
import UserWishlist from './pages/User/Wishlist';
import UserProfile from './pages/User/Profile';
import LandingPage from './pages/LandingPage';
import './App.css';

type Role = 'admin' | 'user' | null;

function LayoutNav({ isAdmin }: { isAdmin: boolean; isAuthenticated: boolean }) {
  const location = useLocation();
  const noNavbarPaths = ['/', '/login', '/register'];
  const hideNavbar = noNavbarPaths.includes(location.pathname);

  if (hideNavbar) return null;
  if (isAdmin) return <AdminSidebar />;
  return <UserNavbar />;
}

function AppLayout({ isAdmin, isAuthenticated }: { isAdmin: boolean; isAuthenticated: boolean }) {
  const location = useLocation();
  const noNavbarPaths = ['/', '/login', '/register'];
  const hideNavbar = noNavbarPaths.includes(location.pathname);
  const showUserNav = !hideNavbar && !isAdmin;

  return (
    <div
      className="App"
      style={{
        display: 'flex',
        flexDirection: showUserNav ? 'column' : 'row',
        minHeight: '100vh',
      }}
    >
      <LayoutNav isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
      <div className={isAdmin ? 'admin-main' : 'container'} style={isAdmin ? { flex: 1, padding: '20px', marginLeft: 0 } : { flex: 1 }}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to={isAdmin ? '/admin/dashboard' : '/shop'} replace /> : <LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/admin/dashboard" element={isAdmin ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/products" element={isAdmin ? <Products /> : <Navigate to="/login" />} />
          <Route path="/admin/products/:id" element={isAdmin ? <ProductDetail /> : <Navigate to="/login" />} />
          <Route path="/admin/categories" element={isAdmin ? <Categories /> : <Navigate to="/login" />} />
          <Route path="/admin/orders" element={isAdmin ? <Orders /> : <Navigate to="/login" />} />
          <Route path="/admin/orders/:id" element={isAdmin ? <OrderDetail /> : <Navigate to="/login" />} />
          <Route path="/admin/stats" element={isAdmin ? <Stats /> : <Navigate to="/login" />} />
          <Route path="/admin/add" element={isAdmin ? <AddAdmin /> : <Navigate to="/login" />} />

          <Route path="/shop" element={isAuthenticated ? <UserMainPage /> : <Navigate to="/login" />} />
          <Route path="/shop/catalog" element={isAuthenticated ? <UserProductCatalog /> : <Navigate to="/login" />} />
          <Route path="/shop/products/:id" element={isAuthenticated ? <UserProductDetail /> : <Navigate to="/login" />} />
          <Route path="/shop/orders" element={isAuthenticated ? <UserOrderList /> : <Navigate to="/login" />} />
          <Route path="/shop/orders/new" element={isAuthenticated ? <UserCreateOrder /> : <Navigate to="/login" />} />
          <Route path="/shop/orders/:id" element={isAuthenticated ? <UserOrderDetail /> : <Navigate to="/login" />} />
          <Route path="/shop/wishlist" element={isAuthenticated ? <UserWishlist /> : <Navigate to="/login" />} />
          <Route path="/shop/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />

          <Route path="*" element={<Navigate to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/shop') : '/'} replace />} />
        </Routes>
      </div>
    </div>
  );
}

const readAuth = (): { isAuthenticated: boolean; role: Role } => {
  const access_token = localStorage.getItem('access_token');
  let role: Role = null;
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw) as { role?: string };
      if (parsed.role === 'admin' || parsed.role === 'user') role = parsed.role;
    }
  } catch {
    role = null;
  }
  return { isAuthenticated: !!access_token, role };
};

function App() {
  const [auth, setAuth] = useState<{ isAuthenticated: boolean; role: Role }>(() => readAuth());

  useEffect(() => {
    const handleAuthChanged = () => setAuth(readAuth());
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
      <AppLayout isAdmin={isAdmin} isAuthenticated={isAuthenticated} />
    </Router>
  );
}

export default App;
