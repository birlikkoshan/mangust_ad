import { useState, useEffect } from 'react';
import { statsAPI, SalesStat, ProductStat } from '../api/stats';

const Stats = () => {
  const [salesStats, setSalesStats] = useState<SalesStat[]>([]);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'sales' | 'products'>('sales');

  useEffect(() => {
    loadStats();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setLoading(true);
      if (activeTab === 'sales') {
        const data = await statsAPI.getSalesStats();
        setSalesStats(data);
      } else {
        const data = await statsAPI.getProductStats();
        setProductStats(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Statistics</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          className={`btn ${activeTab === 'sales' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('sales')}
          style={{ marginRight: '10px' }}
        >
          Sales Statistics
        </button>
        <button
          className={`btn ${activeTab === 'products' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Product Statistics
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {activeTab === 'sales' && (
        <div className="card">
          <h2>Sales by Category</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Revenue</th>
                <th>Total Quantity</th>
                <th>Order Count</th>
              </tr>
            </thead>
            <tbody>
              {salesStats?.map((stat, index) => (
                <tr key={index}>
                  <td>{stat.category}</td>
                  <td>${stat.totalRevenue.toFixed(2)}</td>
                  <td>{stat.totalQuantity}</td>
                  <td>{stat.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="card">
          <h2>Product Statistics</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Average Rating</th>
                <th>Review Count</th>
              </tr>
            </thead>
            <tbody>
              {productStats?.map((stat, index) => (
                <tr key={index}>
                  <td>{stat.name}</td>
                  <td>{stat.categoryName || 'N/A'}</td>
                  <td>${stat.price.toFixed(2)}</td>
                  <td>{stat.stock}</td>
                  <td>⭐ {stat.averageRating.toFixed(1)}</td>
                  <td>{stat.reviewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Stats;
