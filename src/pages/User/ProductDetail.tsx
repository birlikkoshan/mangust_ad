import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsAPI, Product, Review } from '../../api/Admin/products';
import { categoriesAPI } from '../../api/Admin/categories';
import { wishlistAPI } from '../../api/wishlist';
import { getCurrentUser } from '../../api/Admin/client';
import { getAssetUrl } from '../../utils';

const CATEGORY_COLORS = ['#EAEFEF', '#BFC9D1', '#25343F', '#FF9B51'];

const getCategoryColor = (categoryId: string): string => {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; imageUrl?: string }[]>([]);
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
      const [productData, categoriesResult] = await Promise.all([
        productsAPI.getById(id!),
        categoriesAPI.getAll({ offset: 0, limit: 100 }),
      ]);
      setProduct(productData);
      setCategories(categoriesResult.items);
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

  const handleBuyNow = () => {
    navigate('/shop/orders/new', { state: { preselectedItems: [{ productId: id!, quantity: 1 }] } });
  };

  const currentUser = getCurrentUser();
  const canDeleteReview = (r: Review) =>
    currentUser && (r.userId === currentUser.id || currentUser.role === 'admin');

  if (loading) return <div className="user-container" style={{ padding: '48px 20px', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <div className="user-container">Product not found</div>;

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const categoriesMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const categoryImageUrl = getAssetUrl(product.category?.imageUrl ?? categoriesMap[product.categoryId]?.imageUrl);
  const categoryName = product.category?.name ?? categoriesMap[product.categoryId]?.name ?? 'Uncategorized';

  return (
    <div className="user-page">
      <div className="user-container">
        <Link to="/shop/catalog" className="user-btn user-btn-outline" style={{ marginBottom: '24px', display: 'inline-block', textDecoration: 'none' }}>
          ← Back to Catalog
        </Link>

        {error && <div className="user-alert-error">{error}</div>}
        {success && <div className="user-alert-success">{success}</div>}

        <div className="user-card user-product-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '32px', alignItems: 'start' }}>
          <div style={{ position: 'relative', height: '240px', borderRadius: '12px', overflow: 'hidden' }}>
            {categoryImageUrl && (
              <img
                src={categoryImageUrl}
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
              style={{
                position: 'absolute',
                inset: 0,
                display: categoryImageUrl ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: product.categoryId ? getCategoryColor(product.categoryId) : 'var(--user-bg-alt)',
                color: product.categoryId && getCategoryColor(product.categoryId) === '#25343F' ? 'white' : 'var(--user-text)',
                fontSize: '64px',
                fontWeight: 600,
              }}
            >
              {categoryName.charAt(0) || '?'}
            </div>
          </div>
          <div>
            <h1 style={{ marginBottom: '12px', color: 'var(--user-text)' }}>{product.name}</h1>
            <p style={{ color: 'var(--user-text-muted)', marginBottom: '8px' }}>{categoryName}</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--user-accent)', marginBottom: '16px' }}>${product.price.toFixed(2)}</p>
            <p style={{ marginBottom: '24px', lineHeight: 1.6, color: 'var(--user-text)' }}>{product.description || 'No description'}</p>
            <p style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--user-text-muted)' }}>
              Stock: {product.stock} | Rating: {avgRating.toFixed(1)}/5 ({product.reviews.length} reviews)
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="user-btn user-btn-primary" onClick={handleBuyNow}>
                Buy Now
              </button>
              <button className="user-btn user-btn-outline" onClick={handleAddToWishlist}>
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        <div className="user-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: 'var(--user-text)' }}>Reviews</h2>
            {currentUser && (
              <button className="user-btn user-btn-outline" onClick={() => setShowReviewForm(!showReviewForm)}>
                {showReviewForm ? 'Cancel' : 'Add Review'}
              </button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={handleAddReview} style={{ marginBottom: '24px', padding: '20px', background: 'var(--user-bg-alt)', borderRadius: '12px' }}>
              <div className="form-group">
                <label style={{ color: 'var(--user-text)' }}>Rating</label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({ ...reviewData, rating: parseInt(e.target.value) })}
                  required
                  className="user-filter-select"
                  style={{ width: '100%' }}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label style={{ color: 'var(--user-text)' }}>Comment</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--user-border)', borderRadius: '6px', minHeight: '80px' }}
                />
              </div>
              <button type="submit" className="user-btn user-btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {product.reviews.length === 0 ? (
            <p style={{ color: 'var(--user-text-muted)' }}>No reviews yet. Be the first to review!</p>
          ) : (
            <div>
              {product.reviews.map((review) => (
                <div key={review.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--user-bg-alt)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--user-text)' }}>{review.userName}</strong>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      ⭐ {review.rating}/5
                      {canDeleteReview(review) && (
                        <button
                          className="user-btn user-btn-outline"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          Delete
                        </button>
                      )}
                    </span>
                  </div>
                  <p style={{ color: 'var(--user-text)', marginBottom: '4px' }}>{review.comment}</p>
                  <small style={{ color: 'var(--user-text-muted)' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
