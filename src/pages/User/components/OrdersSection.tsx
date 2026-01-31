import SectionCard from "./SectionCard";
import type { Order } from "../../User/types";

interface OrdersSectionProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const OrdersSection = ({ orders, loading, error, onRetry }: OrdersSectionProps) => {
  return (
    <SectionCard
      title="Orders"
      action={
        <button className="btn btn-primary" onClick={onRetry} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      }
    >
      {loading && <p>Loading your orders...</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && orders.length === 0 && <p>No orders yet.</p>}

      {!loading && !error && orders.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id.slice(0, 8)}...</td>
                <td>{order.items.length}</td>
                <td>${order.total.toFixed(2)}</td>
                <td style={{ textTransform: "capitalize" }}>{order.status}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
};

export default OrdersSection;
