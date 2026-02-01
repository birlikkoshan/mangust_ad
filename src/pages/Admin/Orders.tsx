import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI, Order, FindOrdersParams } from '../../api/Admin/orders';
import { productsAPI, Product } from '../../api/Admin/products';
import { usersAPI, AdminUser } from '../../api/Admin/users';
import Pagination from '../../components/Pagination';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);
  const [findMode, setFindMode] = useState(false);
  const [findOrderId, setFindOrderId] = useState('');
  const [findStatus, setFindStatus] = useState('');

  useEffect(() => {
    loadData();
  }, [page, limit]);

  const loadData = async (forceGetAll = false) => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      let ordersResult;
      if (!forceGetAll && findMode && (findOrderId.trim() || findStatus)) {
        const params: FindOrdersParams = { offset, limit };
        if (findOrderId.trim()) params.orderId = findOrderId.trim();
        if (findStatus) params.status = findStatus;
        ordersResult = await ordersAPI.find(params);
      } else {
        ordersResult = await ordersAPI.getAll({ offset, limit });
      }
      const productsResult = await productsAPI.getAll(undefined, { offset: 0, limit: 500 });
      const usersResult = await usersAPI.getAllAdmin();
      setUsers(usersResult.items);         
      setOrders(ordersResult.items);
      setTotalItems(ordersResult.total);
      setProducts(productsResult.items);
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

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await ordersAPI.updateStatus(id, { status });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update order');
    }
  };

  const handleFind = () => {
    setPage(1);
    loadData();
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

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Find Orders</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label>
            Order ID:
            <input
              type="text"
              value={findOrderId}
              onChange={(e) => setFindOrderId(e.target.value)}
              placeholder="Order ID"
              style={{ marginLeft: '8px', padding: '6px 10px', width: '200px' }}
            />
          </label>
          <label>
            Status:
            <select
              value={findStatus}
              onChange={(e) => setFindStatus(e.target.value)}
              style={{ marginLeft: '8px', padding: '6px 10px' }}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <button
            type="button"
            className={`btn ${findMode ? 'btn-primary' : ''}`}
            onClick={() => {
              const next = !findMode;
              setFindMode(next);
              if (!next) {
                setFindOrderId('');
                setFindStatus('');
                setPage(1);
                loadData(true);
              }
            }}
          >
            {findMode ? 'Using filters' : 'Filter'}
          </button>
          {findMode && (
            <button type="button" className="btn btn-success" onClick={handleFind}>
              Search
            </button>
          )}
        </div>
      </div>

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
                <td>
                  <Link to={`/admin/orders/${order.id}`}>{order.id.substring(0, 8)}...</Link>
                </td>
                <td>{order.user?.name || users.find((u) => u.id === order.userId)?.name || order.userId}</td>
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
                  <Link to={`/admin/orders/${order.id}`} className="btn btn-primary">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={page}
          limit={limit}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>
    </div>
  );
};

export default Orders;
