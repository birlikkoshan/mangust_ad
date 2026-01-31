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

  const handleUpdateStatus = async (status: string) => {
    try {
      setError('');
      await ordersAPI.updateStatus(id!, { status });
      loadOrder();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>{error ? <div className="alert alert-error">{error}</div> : 'Order not found'}</div>;

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={() => navigate('/admin/orders')}
        style={{ marginBottom: '20px' }}
      >
        ← Back to Orders
      </button>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h1>Order #{(order.id || id || '').substring(0, 8)}...</h1>
        <p>
          <strong>User:</strong> {order.user?.name || order.user?.email || order.userId}
        </p>
        <p>
          <strong>Status:</strong>{' '}
          <select
            value={order.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
            {(order.items ?? []).map((item, idx) => (
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
  );
};

export default OrderDetail;
