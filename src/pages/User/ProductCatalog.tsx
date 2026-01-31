import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, Product } from '../../api/Admin/products';
import { categoriesAPI, Category } from '../../api/Admin/categories';
import Pagination from '../../components/Pagination';
import { getAssetUrl } from '../../utils';

const CATEGORY_COLORS = ['#EAEFEF', '#BFC9D1', '#25343F', '#FF9B51'];

const getCategoryColor = (categoryId: string): string => {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
};

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, [selectedCategory, page, limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const [productsResult, categoriesResult] = await Promise.all([
        productsAPI.getAll(selectedCategory || undefined, { offset, limit }),
        categoriesAPI.getAll({ offset: 0, limit: 100 }),
      ]);
      setProducts(productsResult.items);
      setTotalItems(productsResult.total ?? productsResult.items.length);
      setCategories(categoriesResult.items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const categoriesMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const getCategoryForProduct = (product: Product) => {
    if (product.category?.name) return product.category;
    const cat = categoriesMap[product.categoryId];
    return cat ? { id: cat.id, name: cat.name, imageUrl: cat.imageUrl } : null;
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
        <h1 style={{ marginBottom: '24px', color: 'var(--user-text)' }}>Catalog</h1>

        {error && <div className="user-alert-error">{error}</div>}

        <div style={{ marginBottom: '24px' }}>
          <label style={{ marginRight: '12px', fontSize: '14px', color: 'var(--user-text-muted)' }}>Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="user-filter-select"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="user-card">
          {products.length === 0 ? (
            <p style={{ color: 'var(--user-text-muted)' }}>No products found.</p>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '24px',
                }}
              >
                {products.map((product) => {
                  const category = getCategoryForProduct(product);
                  const imageUrl = getAssetUrl(category?.imageUrl ?? product.category?.imageUrl);
                  const categoryName = category?.name || product.category?.name || 'Uncategorized';

                  return (
                    <Link
                      key={product.id}
                      to={`/shop/products/${product.id}`}
                      className="user-product-card"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="user-product-card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={categoryName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        )}
                        <div
                          className="user-card-image-fallback"
                          style={{
                            display: imageUrl ? 'none' : 'flex',
                            position: imageUrl ? 'absolute' : 'relative',
                            inset: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: getCategoryColor(product.categoryId || '') || 'var(--user-bg-alt)',
                            color: getCategoryColor(product.categoryId || '') === '#25343F' ? 'white' : 'var(--user-text)',
                            fontSize: '48px',
                            fontWeight: 600,
                          }}
                        >
                          {categoryName.charAt(0) || '?'}
                        </div>
                      </div>
                      <div className="user-product-card-body">
                        <div className="user-product-card-title">{product.name}</div>
                        <div className="user-product-card-price">${product.price.toFixed(2)}</div>
                        <div className="user-product-card-category">{categoryName}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
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

export default ProductCatalog;
