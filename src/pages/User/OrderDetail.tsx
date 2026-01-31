import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI, Order } from '../../api/Admin/orders';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await ordersAPI.getById(id!);
      setOrder(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="user-container" style={{ padding: '48px 20px', textAlign: 'center' }}>Loading...</div>;
  if (!order) return <div className="user-container">{error ? <div className="user-alert-error">{error}</div> : <p style={{ color: 'var(--user-text-muted)' }}>Order not found</p>}</div>;

  return (
    <div className="user-page">
      <div className="user-container">
        <button
          className="user-btn user-btn-outline"
          onClick={() => navigate('/shop/orders')}
          style={{ marginBottom: '24px' }}
        >
          ← Back to Orders
        </button>

        {error && <div className="user-alert-error">{error}</div>}

        <div className="user-card">
        <h1>Order #{order.id.substring(0, 8)}...</h1>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Total:</strong> ${order.total.toFixed(2)}
        </p>
        <p>
          <strong>Created:</strong> {new Date(order.createdAt).toLocaleString()}
        </p>

        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Items</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.product?.name || item.productId}</td>
                <td>{item.quantity}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
