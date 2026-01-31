import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ordersAPI } from '../../api/Admin/orders';
import { productsAPI, Product } from '../../api/Admin/products';
import { categoriesAPI, Category } from '../../api/Admin/categories';
import ProductCard from '../../components/User/ProductCard';
import ProductGrid from '../../components/ProductGrid';
import PageLoading from '../../components/PageLoading';
import ErrorAlert from '../../components/ErrorAlert';
import { getCategoryForProduct } from '../../utils';

interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

const CreateOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselected = (location.state as { preselectedItems?: { productId: string; quantity: number }[] })?.preselectedItems;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() =>
    (preselected ?? []).map((item) => ({ productId: item.productId, quantity: item.quantity }))
  );
  const [paymentCard, setPaymentCard] = useState('');
  const [paymentExpiry, setPaymentExpiry] = useState('');
  const [paymentCvv, setPaymentCvv] = useState('');
  const [paymentName, setPaymentName] = useState('');
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const cartHydratedRef = useRef(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (cartHydratedRef.current || products.length === 0) return;
    cartHydratedRef.current = true;
    setCart((prev) => {
      if (prev.length === 0) return prev;
      return prev.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? { ...item, product } : item;
      });
    });
  }, [products]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResult, categoriesResult] = await Promise.all([
        productsAPI.getAll(undefined, { offset: 0, limit: 500 }),
        categoriesAPI.getAll({ offset: 0, limit: 100 }),
      ]);
      setProducts(productsResult.items);
      setCategories(categoriesResult.items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const categoriesMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const addToCart = (product: Product, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity, product } : i
        );
      }
      return [...prev, { productId: product.id, quantity, product }];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const cartWithProducts = cart.map((item) => ({
    ...item,
    product: item.product ?? products.find((p) => p.id === item.productId),
  }));

  const subtotal = cartWithProducts.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  const isPaymentValid = () => {
    const card = paymentCard.replace(/\s/g, '');
    if (card.length < 13) return false;
    if (!paymentExpiry.match(/^\d{2}\/\d{2}$/)) return false;
    if (paymentCvv.length < 3) return false;
    if (!paymentName.trim()) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    try {
      setSubmitting(true);
      setError('');
      const order = await ordersAPI.create({
        items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
      });
      navigate(`/shop/orders/${order.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  if (loading) {
    return (
      <div className="user-page">
        <PageLoading />
      </div>
    );
  }

  return (
    <div className="user-page">
      <div className="user-container">
        <Link
          to="/shop/orders"
          className="user-btn user-btn-outline"
          style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          ← Back to Orders
        </Link>

        {error && <ErrorAlert message={error} />}

        <h1 style={{ marginBottom: '8px', color: 'var(--user-text)' }}>Create Order</h1>
        <p style={{ color: 'var(--user-text-muted)', marginBottom: '24px' }}>
          Add products from the list below, then enter payment details.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }} className="create-order-layout">
          {/* Product list */}
          <div className="user-card">
            <h2 style={{ marginBottom: '20px', color: 'var(--user-text)', fontSize: '20px' }}>Products</h2>
            {products.length === 0 ? (
              <p style={{ color: 'var(--user-text-muted)', padding: '20px 0' }}>No products available.</p>
            ) : (
              <ProductGrid>
                {products.map((product) => {
                  const category = getCategoryForProduct(product, categoriesMap);
                  const inCart = cart.find((i) => i.productId === product.id);
                  const qty = productQuantities[product.id] ?? 1;
                  const setQty = (n: number) =>
                    setProductQuantities((prev) => ({ ...prev, [product.id]: Math.max(1, Math.min(product.stock, n)) }));
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      category={category}
                      to={`/shop/products/${product.id}`}
                      compact
                    >
                      <div style={{ padding: '0 12px 12px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <input
                          type="number"
                          min={1}
                          max={product.stock}
                          value={qty}
                          onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
                          style={{ width: '56px', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--user-border)' }}
                        />
                        <button
                          type="button"
                          className="user-btn user-btn-primary"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                          onClick={() => addToCart(product, qty)}
                          disabled={product.stock < 1}
                        >
                          {inCart ? '+ Add more' : 'Add to order'}
                        </button>
                      </div>
                    </ProductCard>
                  );
                })}
              </ProductGrid>
            )}
          </div>

          {/* Cart + Payment sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Cart summary */}
            <div className="user-card">
              <h2 style={{ marginBottom: '16px', color: 'var(--user-text)', fontSize: '18px' }}>Your order</h2>
              {cartWithProducts.length === 0 ? (
                <p style={{ color: 'var(--user-text-muted)', fontSize: '14px' }}>Cart is empty. Add products from the list.</p>
              ) : (
                <>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {cartWithProducts.map((item) => (
                      <li
                        key={item.productId}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: '1px solid var(--user-bg-alt)',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 500 }}>{item.product?.name ?? 'Product'}</span>
                          <span style={{ color: 'var(--user-text-muted)', marginLeft: '8px', fontSize: '14px' }}>
                            ×{item.quantity} · ${(item.product?.price ?? 0).toFixed(2)} each
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--user-accent)' }}>
                            ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, -1)}
                            style={{ padding: '4px 8px', fontSize: '12px', border: 'none', background: 'var(--user-bg-alt)', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            −
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, 1)}
                            style={{ padding: '4px 8px', fontSize: '12px', border: 'none', background: 'var(--user-bg-alt)', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId)}
                            style={{ padding: '4px 8px', fontSize: '12px', color: '#b91c1c', border: 'none', background: 'transparent', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid var(--user-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--user-text)' }}>Subtotal</span>
                    <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--user-accent)' }}>${subtotal.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Payment info */}
            <div className="user-card">
              <h2 style={{ marginBottom: '16px', color: 'var(--user-text)', fontSize: '18px' }}>Payment</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--user-text-muted)' }}>Card number</span>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentCard}
                    onChange={(e) => setPaymentCard(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="user-filter-select"
                  />
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', flex: 1 }}>
                    <span style={{ color: 'var(--user-text-muted)' }}>Expiry (MM/YY)</span>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={paymentExpiry}
                      onChange={(e) => setPaymentExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      className="user-filter-select"
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', flex: 1 }}>
                    <span style={{ color: 'var(--user-text-muted)' }}>CVV</span>
                    <input
                      type="text"
                      placeholder="123"
                      value={paymentCvv}
                      onChange={(e) => setPaymentCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="user-filter-select"
                    />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--user-text-muted)' }}>Name on card</span>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={paymentName}
                    onChange={(e) => setPaymentName(e.target.value)}
                    className="user-filter-select"
                  />
                </label>
                <button
                  type="submit"
                  className="user-btn user-btn-primary"
                  disabled={cart.length === 0 || submitting || !isPaymentValid()}
                  style={{ marginTop: '8px', padding: '12px 20px' }}
                >
                  {submitting ? 'Placing order...' : `Place order · $${subtotal.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
