import { Link } from 'react-router-dom';
import { getAssetUrl, getCategoryColor } from '../../utils';
import type { Product } from '../../api/Admin/products';

interface CategoryInfo {
  id?: string;
  name: string;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
  category?: CategoryInfo | null;
  to?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

function ProductCardContent({
  product,
  category,
  compact,
}: {
  product: Product;
  category?: CategoryInfo | null;
  compact?: boolean;
}) {
  const categoryName = category?.name || product.category?.name || 'Uncategorized';
  const imageUrl = getAssetUrl(category?.imageUrl ?? product.category?.imageUrl);
  const color = getCategoryColor(product.categoryId || '');

  return (
    <>
      <div
        className="user-product-card-image"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={categoryName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const fb = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
              if (fb) fb.style.display = 'flex';
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
            background: color || 'var(--user-bg-alt)',
            color: color === '#25343F' ? 'white' : 'var(--user-text)',
            fontSize: compact ? '32px' : '48px',
            fontWeight: 600,
          }}
        >
          {categoryName.charAt(0) || '?'}
        </div>
      </div>
      <div className="user-product-card-body" style={compact ? { padding: '12px' } : undefined}>
        <div className="user-product-card-title" style={compact ? { fontSize: '14px' } : undefined}>
          {product.name}
        </div>
        <div className="user-product-card-price" style={compact ? { fontSize: '16px' } : undefined}>
          ${product.price.toFixed(2)}
        </div>
        {!compact && <div className="user-product-card-category">{categoryName}</div>}
      </div>
    </>
  );
}

export default function ProductCard({
  product,
  category,
  to = `/shop/products/${product.id}`,
  compact = false,
  children,
}: ProductCardProps) {
  const cardClass = `user-product-card${compact ? ' create-order-product-card' : ''}`;
  const content = <ProductCardContent product={product} category={category} compact={compact} />;

  if (children) {
    return (
      <div className={cardClass} style={{ margin: compact ? 0 : undefined }}>
        <Link to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
          {content}
        </Link>
        {children}
      </div>
    );
  }

  return (
    <Link to={to} className={cardClass} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  );
}
