import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistAPI, WishlistItem } from '../../api/wishlist';
import { categoriesAPI } from '../../api/Admin/categories';
import { productsAPI, Product } from '../../api/Admin/products';
import Pagination from '../../components/Pagination';
import ProductGrid from '../../components/ProductGrid';
import WishlistItemCard from '../../components/User/WishlistItemCard';
import PageLoading from '../../components/PageLoading';
import ErrorAlert from '../../components/ErrorAlert';

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
    const preselectedItems = items.map((item) => ({ productId: item.productId, quantity: 1 }));
    navigate('/shop/orders/new', { state: { preselectedItems } });
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const categoriesMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  if (loading) return <PageLoading />;

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
        {error && <ErrorAlert message={error} />}
        <div className="user-card">
          {items.length === 0 ? (
            <p style={{ color: 'var(--user-text-muted)' }}>
              Your wishlist is empty. <Link to="/shop/catalog" style={{ color: 'var(--user-accent)' }}>Browse catalog</Link>
            </p>
          ) : (
            <>
              <ProductGrid>
                {items.map((item) => (
                  <WishlistItemCard
                    key={item.id}
                    item={item}
                    product={productMap[item.productId] ?? item.product}
                    categoriesMap={categoriesMap}
                    onRemove={handleRemove}
                  />
                ))}
              </ProductGrid>
              <Pagination
                page={page}
                limit={limit}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                limitOptions={[5, 10, 20, 50]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
