import { useState, useEffect } from 'react';
import { productsAPI, Product } from '../../api/Admin/products';
import { categoriesAPI, Category } from '../../api/Admin/categories';
import Pagination from '../../components/Pagination';
import CategoryFilter from '../../components/CategoryFilter';
import ProductGrid from '../../components/ProductGrid';
import ProductCard from '../../components/User/ProductCard';
import PageLoading from '../../components/PageLoading';
import ErrorAlert from '../../components/ErrorAlert';
import { getCategoryForProduct } from '../../utils';

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
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
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  if (loading) return <PageLoading />;

  return (
    <div className="user-page">
      <div className="user-container">
        <h1 style={{ marginBottom: '24px', color: 'var(--user-text)' }}>Catalog</h1>
        {error && <ErrorAlert message={error} />}
        <CategoryFilter
          categories={categories}
          value={selectedCategory}
          onChange={handleCategoryChange}
        />

        <div className="user-card">
          {products.length === 0 ? (
            <p style={{ color: 'var(--user-text-muted)' }}>No products found.</p>
          ) : (
            <>
              <ProductGrid>
                {products.map((product) => {
                  const category = getCategoryForProduct(product, categoriesMap);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      category={category}
                      to={`/shop/products/${product.id}`}
                    />
                  );
                })}
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

export default ProductCatalog;
