import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, Product } from '../../api/Admin/products';
import { categoriesAPI, Category } from '../../api/Admin/categories';
import Pagination from '../../components/Admin/Pagination';

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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
      setTotalItems(productsResult.total);
      setCategories(categoriesResult.items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Products</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ marginBottom: '20px' }}>
        <label>Filter by Category: </label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          style={{ padding: '8px', marginLeft: '10px' }}
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link to={`/shop/products/${product.id}`}>{product.name}</Link>
                  </td>
                  <td>{product.category?.name || 'N/A'}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <Link to={`/shop/products/${product.id}`} className="btn btn-primary">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

export default ProductCatalog;
