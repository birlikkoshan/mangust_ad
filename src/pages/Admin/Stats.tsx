import { useState, useEffect } from 'react';
import { statsAPI, SalesStats, ProductStats, StatsFilters } from '../../api/Admin/stats';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Stats = () => {
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'sales' | 'products'>('sales');
  const [year, setYear] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');

  useEffect(() => {
    loadStats();
  }, [activeTab, year, start, end]);

  const filters: StatsFilters = {};
  if (year) filters.year = parseInt(year, 10);
  if (start) filters.start = start;
  if (end) filters.end = end;

  const loadStats = async () => {
    try {
      setLoading(true);
      if (activeTab === 'sales') {
        const data = await statsAPI.getSalesStats(filters);
        setSalesStats(data);
      } else {
        const data = await statsAPI.getProductStats(filters);
        setProductStats(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
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

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Filters</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label>
            Year:
            <input
              type="number"
              min="2020"
              max="2030"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2024"
              style={{ marginLeft: '8px', padding: '6px 10px', width: '100px' }}
            />
          </label>
          <label>
            Start:
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={{ marginLeft: '8px', padding: '6px 10px' }}
            />
          </label>
          <label>
            End:
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              style={{ marginLeft: '8px', padding: '6px 10px' }}
            />
          </label>
        </div>
      </div>

      {activeTab === 'sales' && salesStats && (
        <div>
          {/* Summary Cards */}
          <div className="card" style={{ marginBottom: '30px' }}>
            <h2>Sales Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Revenue</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{formatCurrency(salesStats.totalRevenue)}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Average Order</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{formatCurrency(salesStats.averageOrder)}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Orders</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{salesStats.totalOrders}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            {/* Order Status Pie Chart */}
            <div className="card">
              <h2>Order Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Delivered', value: salesStats.deliveredOrders, color: '#28a745' },
                      { name: 'Shipped', value: salesStats.shippedOrders, color: '#ff9800' },
                      { name: 'Pending', value: salesStats.pendingOrders, color: '#2196f3' },
                      { name: 'Cancelled', value: salesStats.cancelledOrders, color: '#f44336' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Delivered', value: salesStats.deliveredOrders, color: '#28a745' },
                      { name: 'Shipped', value: salesStats.shippedOrders, color: '#ff9800' },
                      { name: 'Pending', value: salesStats.pendingOrders, color: '#2196f3' },
                      { name: 'Cancelled', value: salesStats.cancelledOrders, color: '#f44336' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status Bar Chart */}
            <div className="card">
              <h2>Order Status Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { status: 'Delivered', count: salesStats.deliveredOrders, fill: '#28a745' },
                    { status: 'Shipped', count: salesStats.shippedOrders, fill: '#ff9800' },
                    { status: 'Pending', count: salesStats.pendingOrders, fill: '#2196f3' },
                    { status: 'Cancelled', count: salesStats.cancelledOrders, fill: '#f44336' },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Orders">
                    {[
                      { status: 'Delivered', count: salesStats.deliveredOrders, fill: '#28a745' },
                      { status: 'Shipped', count: salesStats.shippedOrders, fill: '#ff9800' },
                      { status: 'Pending', count: salesStats.pendingOrders, fill: '#2196f3' },
                      { status: 'Cancelled', count: salesStats.cancelledOrders, fill: '#f44336' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && productStats && (
        <div>
          {/* Summary Cards */}
          <div className="card" style={{ marginBottom: '30px' }}>
            <h2>Product Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Products</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{productStats.totalProducts}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Categories</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{productStats.totalCategories}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Stock</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{productStats.totalStock.toLocaleString()}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: '#fff8e1', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Average Rating</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>⭐ {productStats.averageRating.toFixed(1)}</p>
              </div>
              <div className="stat-card" style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Reviews</h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{productStats.totalReviews}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            {/* Stock Status Pie Chart */}
            <div className="card">
              <h2>Stock Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'In Stock', value: productStats.totalProducts - productStats.outOfStock, color: '#28a745' },
                      { name: 'Out of Stock', value: productStats.outOfStock, color: '#f44336' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent, value }) => `${name}: ${value} (${((percent ?? 0) * 100).toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'In Stock', value: productStats.totalProducts - productStats.outOfStock, color: '#28a745' },
                      { name: 'Out of Stock', value: productStats.outOfStock, color: '#f44336' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Product Metrics Bar Chart */}
            <div className="card">
              <h2>Product Metrics</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { metric: 'Total Products', value: productStats.totalProducts, fill: '#007bff' },
                    { metric: 'Categories', value: productStats.totalCategories, fill: '#6610f2' },
                    { metric: 'In Stock', value: productStats.totalProducts - productStats.outOfStock, fill: '#28a745' },
                    { metric: 'Out of Stock', value: productStats.outOfStock, fill: '#f44336' },
                    { metric: 'Total Reviews', value: productStats.totalReviews, fill: '#ffc107' },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count">
                    {[
                      { metric: 'Total Products', value: productStats.totalProducts, fill: '#007bff' },
                      { metric: 'Categories', value: productStats.totalCategories, fill: '#6610f2' },
                      { metric: 'In Stock', value: productStats.totalProducts - productStats.outOfStock, fill: '#28a745' },
                      { metric: 'Out of Stock', value: productStats.outOfStock, fill: '#f44336' },
                      { metric: 'Total Reviews', value: productStats.totalReviews, fill: '#ffc107' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
