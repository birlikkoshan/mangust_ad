import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Stats from './pages/Stats';
import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/products" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/products" />} />
            <Route path="/products" element={isAuthenticated ? <Products /> : <Navigate to="/login" />} />
            <Route path="/products/:id" element={isAuthenticated ? <ProductDetail /> : <Navigate to="/login" />} />
            <Route path="/categories" element={isAuthenticated ? <Categories /> : <Navigate to="/login" />} />
            <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" />} />
            <Route path="/stats" element={isAuthenticated ? <Stats /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to="/products" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
