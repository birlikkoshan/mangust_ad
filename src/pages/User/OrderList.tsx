import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI, Order } from '../../api/Admin/orders';
import Pagination from '../../components/Pagination';

const OrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, [page, limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const result = await ordersAPI.getAll({ offset, limit });
      setOrders(result.items);
      setTotalItems(result.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  if (loading) return <div className="user-container" style={{ padding: '48px 20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="user-page">
      <div className="user-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ color: 'var(--user-text)' }}>My Orders</h1>
          <Link to="/shop/orders/new" className="user-btn user-btn-primary" style={{ textDecoration: 'none' }}>
            Create Order
          </Link>
        </div>

        {error && <div className="user-alert-error">{error}</div>}

        <div className="user-card">
          {orders.length === 0 ? (
            <p style={{ color: 'var(--user-text-muted)' }}>No orders yet. <Link to="/shop/orders/new" style={{ color: 'var(--user-accent)' }}>Create your first order</Link></p>
          ) : (
            <table className="table" style={{ border: '1px solid var(--user-bg-alt)' }}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id.substring(0, 8)}...</td>
                  <td>{order.items.length} item(s)</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/shop/orders/${order.id}`} className="user-btn user-btn-primary" style={{ textDecoration: 'none' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        <Pagination
          page={page}
          limit={limit}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
        </div>
      </div>
    </div>
  );
};

export default OrderList;
