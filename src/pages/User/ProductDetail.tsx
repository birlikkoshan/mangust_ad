import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, Product, Review } from '../../api/Admin/products';
import { wishlistAPI } from '../../api/wishlist';
import { getCurrentUser } from '../../api/Admin/client';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await productsAPI.getById(id!);
      setProduct(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      await productsAPI.addReview(id!, reviewData);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      loadProduct();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;
    try {
      setError('');
      await productsAPI.deleteReview(id!, reviewId);
      loadProduct();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleAddToWishlist = async () => {
    try {
      setError('');
      setSuccess('');
      await wishlistAPI.add(id!);
      setSuccess('Added to wishlist');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  const currentUser = getCurrentUser();
  const canDeleteReview = (r: Review) =>
    currentUser && (r.userId === currentUser.id || currentUser.role === 'admin');

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={() => navigate('/shop')}
        style={{ marginBottom: '20px' }}
      >
        ← Back to Products
      </button>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h1>{product.name}</h1>
        <p>
          <strong>Category:</strong> {product.category?.name || 'N/A'}
        </p>
        <p>
          <strong>Price:</strong> ${product.price.toFixed(2)}
        </p>
        <p>
          <strong>Stock:</strong> {product.stock}
        </p>
        <p>
          <strong>Average Rating:</strong> {avgRating.toFixed(1)} / 5.0 ({product.reviews.length}{' '}
          reviews)
        </p>
        <p>
          <strong>Description:</strong> {product.description || 'No description'}
        </p>
        <div style={{ marginTop: '15px' }}>
          <button className="btn btn-success" onClick={handleAddToWishlist}>
            Add to Wishlist
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Reviews</h2>
          {currentUser && (
            <button className="btn btn-primary" onClick={() => setShowReviewForm(!showReviewForm)}>
              {showReviewForm ? 'Cancel' : 'Add Review'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form
            onSubmit={handleAddReview}
            style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}
          >
            <div className="form-group">
              <label>Rating</label>
              <select
                value={reviewData.rating}
                onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                required
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {product.reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          <div>
            {product.reviews.map((review) => (
              <div key={review.id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong>{review.userName}</strong>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⭐ {review.rating}/5
                    {canDeleteReview(review) && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        Delete
                      </button>
                    )}
                  </span>
                </div>
                <p>{review.comment}</p>
                <small style={{ color: '#666' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
