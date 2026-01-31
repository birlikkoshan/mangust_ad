import { Link } from 'react-router-dom';

const MainPage = () => {
  return (
    <div className="user-page">
      <div className="user-container">
        <div className="user-main-hero">
          <h1>Welcome to Mangust AD</h1>
          <p>Discover our collection of products. Browse the catalog, add items to your wishlist, and create orders with ease.</p>
          <Link to="/shop/catalog" className="user-btn user-btn-primary">
            Browse Catalog
          </Link>
        </div>
        <div className="user-card" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Link to="/shop/catalog" className="user-card" style={{ flex: '1', minWidth: '200px', textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ marginBottom: '8px' }}>Catalog</h3>
            <p style={{ fontSize: '14px', color: 'var(--user-text-muted)' }}>Browse all products by category</p>
          </Link>
          <Link to="/shop/orders" className="user-card" style={{ flex: '1', minWidth: '200px', textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ marginBottom: '8px' }}>My Orders</h3>
            <p style={{ fontSize: '14px', color: 'var(--user-text-muted)' }}>View and manage your orders</p>
          </Link>
          <Link to="/shop/wishlist" className="user-card" style={{ flex: '1', minWidth: '200px', textDecoration: 'none', color: 'inherit' }}>
            <h3 style={{ marginBottom: '8px' }}>Wishlist</h3>
            <p style={{ fontSize: '14px', color: 'var(--user-text-muted)' }}>Your saved items</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
