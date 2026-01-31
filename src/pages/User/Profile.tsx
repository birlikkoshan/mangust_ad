import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import userAPI from "../../api/User";
import { getCurrentUser, notifyAuthChanged } from "../../api/Admin/client";
import type { Order, WishlistItem } from "./types";
import ProfileHeader from "./components/ProfileHeader";
import OrdersSection from "./components/OrdersSection";
import WishlistSection from "./components/WishlistSection";

const Profile = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const user = useMemo(() => getCurrentUser(), []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadOrders();
    loadWishlist();
  }, []);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrdersError(null);
      const data = await userAPI.getMyOrders();
      setOrders(data);
    } catch (err) {
      setOrdersError(userAPI.getErrorMessage(err));
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadWishlist = async () => {
    try {
      setLoadingWishlist(true);
      setWishlistError(null);
      const data = await userAPI.getWishlist();
      setWishlist(data);
    } catch (err) {
      setWishlistError(userAPI.getErrorMessage(err));
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleRemoveWishlist = async (id: string) => {
    try {
      await userAPI.removeFromWishlist(id);
      setWishlist((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setWishlistError(userAPI.getErrorMessage(err));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    notifyAuthChanged();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <ProfileHeader
        user={user}
        stats={{ orders: orders.length, wishlist: wishlist.length }}
      />

      <div className="card" style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button className="btn" onClick={handleLogout}>
          Log out
        </button>
        <button className="btn" onClick={() => window.location.reload()}>
          Force reload
        </button>
      </div>

      <OrdersSection
        orders={orders}
        loading={loadingOrders}
        error={ordersError}
        onRetry={loadOrders}
      />

      <WishlistSection
        items={wishlist}
        loading={loadingWishlist}
        error={wishlistError}
        onRemove={handleRemoveWishlist}
        onRetry={loadWishlist}
      />
    </div>
  );
};

export default Profile;
