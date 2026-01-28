import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, Product } from '../../api/Admin/products';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
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
      await productsAPI.addReview(id!, reviewData);
      setShowReviewForm(false);
      setReviewData({ rating: 5, comment: '' });
      loadProduct();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add review');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  return (
    <div>
      <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ marginBottom: '20px' }}>
        ← Back to Products
      </button>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h1>{product.name}</h1>
        <p><strong>Category:</strong> {product.category?.name || 'N/A'}</p>
        <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
        <p><strong>Stock:</strong> {product.stock}</p>
        <p><strong>Average Rating:</strong> {avgRating.toFixed(1)} / 5.0 ({product.reviews.length} reviews)</p>
        <p><strong>Description:</strong> {product.description || 'No description'}</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Reviews</h2>
          <button className="btn btn-primary" onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? 'Cancel' : 'Add Review'}
          </button>
        </div>

        {showReviewForm && (
          <form onSubmit={handleAddReview} style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
            <div className="form-group">
              <label>Rating</label>
              <select
                value={reviewData.rating}
                onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                required
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
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
            <button type="submit" className="btn btn-primary">Submit Review</button>
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
                  <span>⭐ {review.rating}/5</span>
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
