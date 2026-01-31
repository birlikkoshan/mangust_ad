import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../api/Admin/orders';
import { productsAPI, Product } from '../../api/Admin/products';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number }[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await productsAPI.getAll(undefined, { offset: 0, limit: 500 });
      setProducts(result.items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
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
      setSubmitting(true);
      setError('');
      const order = await ordersAPI.create({ items: orderItems });
      setOrderItems([]);
      navigate(`/shop/orders/${order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={() => navigate('/shop/orders')}
        style={{ marginBottom: '20px' }}
      >
        ← Back to Orders
      </button>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h2>Create Order</h2>
        <form onSubmit={handleSubmit}>
          {orderItems.map((item, index) => (
            <div
              key={index}
              style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}
            >
              <select
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                required
                style={{ flex: 2 }}
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${p.price.toFixed(2)} (Stock: {p.stock})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                required
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleRemoveItem(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddItem}
            style={{ marginBottom: '10px' }}
          >
            Add Item
          </button>
          <br />
          <button
            type="submit"
            className="btn btn-success"
            disabled={orderItems.length === 0 || submitting}
          >
            {submitting ? 'Creating...' : 'Create Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
