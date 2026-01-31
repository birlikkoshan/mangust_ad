import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI, WishlistItem } from '../../api/wishlist';
import Pagination from '../../components/Admin/Pagination';

const Wishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadData();
  }, [page, limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const result = await wishlistAPI.getAll({ offset, limit });
      setItems(result.items);
      setTotalItems(result.total);
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

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Wishlist</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {items.length === 0 ? (
          <p>Your wishlist is empty. <Link to="/shop">Browse products</Link></p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/shop/products/${item.productId}`}>
                      {item.product?.name || item.productId}
                    </Link>
                  </td>
                  <td>{item.product?.price != null ? `$${item.product.price.toFixed(2)}` : 'N/A'}</td>
                  <td>
                    <Link to={`/shop/products/${item.productId}`} className="btn btn-primary" style={{ marginRight: '8px' }}>
                      View
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemove(item.id)}
                    >
                      Remove
                    </button>
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

export default Wishlist;
