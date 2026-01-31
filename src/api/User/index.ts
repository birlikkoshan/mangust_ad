import apiClient, { CurrentUser, getCurrentUser } from "../Admin/client";
import type { Order as AdminOrder, OrderItem as AdminOrderItem } from "../Admin/orders";

export type Order = AdminOrder;
export type OrderItem = AdminOrderItem;

export interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  stock?: number;
  description?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product?: WishlistProduct;
  addedAt?: string;
}

export interface ProfileSummary {
  user: CurrentUser;
  orderCount: number;
  wishlistCount: number;
}

const getErrorMessage = (err: unknown): string => {
  const anyErr = err as any;
  const apiMessage = anyErr?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim().length > 0) return apiMessage;
  if (anyErr?.response?.status) return `Request failed (${anyErr.response.status})`;
  if (err instanceof Error && err.message) return err.message;
  return "Request failed";
};

export const userAPI = {
  /**
   * Returns the authenticated user cached on the client.
   */
  getLocalProfile: (): CurrentUser | null => getCurrentUser(),

  /**
   * Load current user's orders. Backend already filters by user when role=user.
   */
  getMyOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get("/orders");
    return response.data.data as Order[];
  },

  /**
   * Load current user's wishlist items.
   */
  getWishlist: async (): Promise<WishlistItem[]> => {
    const response = await apiClient.get("/wishlist");
    const items = (response.data.data || []) as any[];
    return items.map((item) => ({
      ...item,
      id: item.id || item._id || item.wishlistId || String(item.productId),
    })) as WishlistItem[];
  },

  addToWishlist: async (productId: string): Promise<WishlistItem> => {
    const response = await apiClient.post("/wishlist", { product_id: productId });
    return response.data.data as WishlistItem;
  },

  removeFromWishlist: async (wishlistItemId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${wishlistItemId}`);
  },

  /**
   * Convenience helper for UI summary tiles.
   */
  getProfileSummary: async (): Promise<ProfileSummary> => {
    const [orders, wishlist] = await Promise.all([
      userAPI.getMyOrders(),
      userAPI.getWishlist(),
    ]);
    const user = getCurrentUser();
    if (!user) throw new Error("Not authenticated");
    return {
      user,
      orderCount: orders.length,
      wishlistCount: wishlist.length,
    };
  },

  getErrorMessage,
};

export default userAPI;
