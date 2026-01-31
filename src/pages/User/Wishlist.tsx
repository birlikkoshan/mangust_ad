import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistAPI, WishlistItem } from '../../api/wishlist';
import { categoriesAPI } from '../../api/Admin/categories';
import { productsAPI, Product } from '../../api/Admin/products';
import Pagination from '../../components/Pagination';
import { getAssetUrl } from '../../utils';

const CATEGORY_COLORS = ['#EAEFEF', '#BFC9D1', '#25343F', '#FF9B51'];

const getCategoryColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
};

const Wishlist = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; imageUrl?: string }[]>([]);
  const [productMap, setProductMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, [page, limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (page - 1) * limit;
      const [wishlistResult, categoriesResult] = await Promise.all([
        wishlistAPI.getAll({ offset, limit }),
        categoriesAPI.getAll({ offset: 0, limit: 100 }),
      ]);
      setItems(wishlistResult.items);
      setTotalItems(wishlistResult.total);
      setCategories(categoriesResult.items);

      const productIds = wishlistResult.items.map((i) => i.productId).filter(Boolean);
      const productResults = await Promise.all(productIds.map((id) => productsAPI.getById(id)));
      const map: Record<string, Product> = {};
      productResults.forEach((p, idx) => {
        if (productIds[idx]) map[productIds[idx]] = p;
      });
      setProductMap(map);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove from wishlist?')) return;
    try {
      setError('');
      await wishlistAPI.remove(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handleCreateOrder = () => {
    const preselectedItems = items.map((item) => ({
      productId: item.productId,
      quantity: 1,
    }));
    navigate('/shop/orders/new', { state: { preselectedItems } });
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const categoriesMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  if (loading) return <div className="user-container" style={{ padding: '48px 20px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="user-page">
      <div className="user-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ color: 'var(--user-text)' }}>Wishlist</h1>
          {items.length > 0 && (
            <button className="user-btn user-btn-primary" onClick={handleCreateOrder}>
              Create Order from Wishlist
            </button>
          )}
        </div>

        {error && <div className="user-alert-error">{error}</div>}

        <div className="user-card">
          {items.length === 0 ? (
            <p style={{ color: 'var(--user-text-muted)' }}>Your wishlist is empty. <Link to="/shop/catalog" style={{ color: 'var(--user-accent)' }}>Browse catalog</Link></p>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '24px',
                }}
              >
                {items.map((item) => {
                  const product = productMap[item.productId] ?? item.product;
                  const categoryId = product?.categoryId ?? (product as Product & { category_id?: string })?.category_id;
                  const cat = categoryId ? categoriesMap[categoryId] : product?.category ? { name: product.category.name ?? '', imageUrl: product.category.imageUrl } : null;
                  const categoryImageUrl = getAssetUrl(cat?.imageUrl);
                  const categoryName = cat?.name ?? 'Uncategorized';
                  const productName = product?.name ?? item.product?.name ?? item.productId;
                  const productPrice = product?.price ?? item.product?.price;
                  return (
                    <div key={item.id} className="user-product-card">
                      <Link
                        to={`/shop/products/${item.productId}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="user-product-card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                          {categoryImageUrl ? (
                            <img
                              src={categoryImageUrl}
                              alt={categoryName || productName}
                              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            style={{
                              display: categoryImageUrl ? 'none' : 'flex',
                              position: 'absolute',
                              inset: 0,
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: getCategoryColor(categoryId ?? item.productId),
                              color: getCategoryColor(categoryId ?? item.productId) === '#25343F' ? 'white' : 'var(--user-text)',
                              fontSize: '48px',
                              fontWeight: 600,
                            }}
                          >
                            {(categoryName || productName).charAt(0) || '?'}
                          </div>
                        </div>
                        <div className="user-product-card-body">
                          <div className="user-product-card-title">{productName}</div>
                          <div className="user-product-card-price">
                            {productPrice != null ? `$${Number(productPrice).toFixed(2)}` : 'N/A'}
                          </div>
                        </div>
                      </Link>
                      <div style={{ padding: '0 16px 16px', display: 'flex', gap: '8px' }}>
                        <Link
                          to={`/shop/products/${item.productId}`}
                          className="user-btn user-btn-primary"
                          style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '8px' }}
                        >
                          View
                        </Link>
                        <Link
                          to="/shop/orders/new"
                          state={{ preselectedItems: [{ productId: item.productId, quantity: 1 }] }}
                          className="user-btn user-btn-outline"
                          style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '8px' }}
                        >
                          Buy Now
                        </Link>
                        <button
                          className="user-btn user-btn-outline"
                          onClick={() => handleRemove(item.id)}
                          style={{ padding: '8px' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination
                page={page}
                limit={limit}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                limitOptions={[8, 12, 24, 48]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
