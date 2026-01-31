import { Link } from 'react-router-dom';
import { getAssetUrl, getCategoryColor } from '../../utils';
import type { WishlistItem } from '../../api/wishlist';
import type { Product } from '../../api/Admin/products';

interface WishlistItemCardProps {
  item: WishlistItem;
  product: Product | WishlistItem['product'] | undefined;
  categoriesMap: Record<string, { id: string; name: string; imageUrl?: string }>;
  onRemove: (id: string) => void;
}

export default function WishlistItemCard({
  item,
  product,
  categoriesMap,
  onRemove,
}: WishlistItemCardProps) {
  const categoryId = product?.categoryId ?? (product as Product & { category_id?: string })?.category_id;
  const cat = categoryId ? categoriesMap[categoryId] : product?.category ? { name: product.category.name ?? '', imageUrl: product.category.imageUrl } : null;
  const imageUrl = getAssetUrl(cat?.imageUrl);
  const categoryName = cat?.name ?? 'Uncategorized';
  const productName = product?.name ?? item.product?.name ?? item.productId;
  const productPrice = product?.price ?? item.product?.price;
  const color = getCategoryColor(categoryId ?? item.productId);

  return (
    <div className="user-product-card">
      <Link to={`/shop/products/${item.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="user-product-card-image" style={{ position: 'relative', overflow: 'hidden' }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={categoryName || productName}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fb = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                if (fb) fb.style.display = 'flex';
              }}
            />
          )}
          <div
            style={{
              display: imageUrl ? 'none' : 'flex',
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              background: color,
              color: color === '#25343F' ? 'white' : 'var(--user-text)',
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
          onClick={() => onRemove(item.id)}
          style={{ padding: '8px' }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
