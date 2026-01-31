import SectionCard from "./SectionCard";
import type { WishlistItem } from "../../User/types";

interface WishlistSectionProps {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  onRemove: (id: string) => void;
  onRetry: () => void;
}

const WishlistSection = ({ items, loading, error, onRemove, onRetry }: WishlistSectionProps) => {
  return (
    <SectionCard
      title="Wishlist"
      action={
        <button className="btn btn-primary" onClick={onRetry} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      {loading && <p>Loading your wishlist...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && items.length === 0 && <p>Your wishlist is empty.</p>}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
          {items.map((item) => (
            <div key={item.id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>{item.product?.name || "Product"}</h3>
                  <p style={{ margin: 0, color: "#6c757d" }}>
                    {item.product?.price ? `$${item.product.price.toFixed(2)}` : "Price unavailable"}
                  </p>
                  {item.product?.stock !== undefined && (
                    <p style={{ margin: "6px 0 0", color: "#6c757d" }}>In stock: {item.product.stock}</p>
                  )}
                </div>
                <button className="btn btn-danger" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};

export default WishlistSection;
