import { useState, useEffect } from 'react';
import { ordersAPI, Order } from '../../api/Admin/orders';
import { productsAPI, Product } from '../../api/Admin/products';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        ordersAPI.getAll(),
        productsAPI.getAll(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ordersAPI.create({ items: orderItems });
      setShowForm(false);
      setOrderItems([]);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await ordersAPI.updateStatus(id, { status });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await ordersAPI.delete(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete order');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Order'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card">
          <h3>Create Order</h3>
          <form onSubmit={handleSubmit}>
            {orderItems?.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <select
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  required
                  style={{ flex: 2 }}
                >
                  <option value="">Select Product</option>
                  {products?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${p.price.toFixed(2)} (Stock: {p.stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  required
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-danger" onClick={() => handleRemoveItem(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-primary" onClick={handleAddItem} style={{ marginBottom: '10px' }}>
              Add Item
            </button>
            <br />
            <button type="submit" className="btn btn-success" disabled={orderItems.length === 0}>
              Create Order
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id}>
                <td>{order.id.substring(0, 8)}...</td>
                <td>{order.user?.name || order.userId}</td>
                <td>{order.items.length} item(s)</td>
                <td>${order.total.toFixed(2)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(order.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
