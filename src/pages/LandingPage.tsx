import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="user-page">
      <div className="user-container">
        <div className="user-main-hero">
          <h1>Mangust AD</h1>
          <p>
            Mangust AD is an e-commerce platform for browsing products, managing orders, and building your wishlist.
            Discover our catalog, add items to your wishlist, and create orders with ease.
          </p>
          <p style={{ fontSize: '14px', marginTop: '12px', opacity: 0.9 }}>
            Sign in or register to get started.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="user-btn user-btn-primary">
              Login
            </Link>
            <Link to="/register" className="user-btn user-btn-outline">
              Register
            </Link>
          </div>
        </div>
        <div className="user-card" style={{ marginTop: '32px' }}>
          <h2 style={{ marginBottom: '16px', color: 'var(--user-text)' }}>About the Project</h2>
          <p style={{ lineHeight: 1.7, color: 'var(--user-text)', marginBottom: '12px' }}>
            Mangust AD provides a full-featured shopping experience with product catalog, category filtering,
            wishlist management, and order tracking. Browse products, read reviews, and create orders directly
            from product pages or your wishlist.
          </p>
          <ul style={{ paddingLeft: '24px', lineHeight: 1.8, color: 'var(--user-text)' }}>
            <li>Browse products by category</li>
            <li>Add items to wishlist</li>
            <li>Create and track orders</li>
            <li>Leave and manage reviews</li>
            <li>Update your profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
