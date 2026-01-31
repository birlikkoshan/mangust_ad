import type { CurrentUser } from "../../api/Admin/client";
import type { Order, OrderItem, WishlistItem, WishlistProduct } from "../../api/User";

export type { CurrentUser, Order, OrderItem, WishlistItem, WishlistProduct };

export interface ProfileSectionState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}
