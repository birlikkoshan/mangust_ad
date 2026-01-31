import apiClient from './Admin/client';

export interface WishlistItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
    description?: string;
    stock?: number;
  };
  userId?: string;
  createdAt?: string;
}

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

function normalizeWishlistItem(raw: any): WishlistItem {
  const product = raw.product
    ? {
        id: raw.product.id ?? raw.product._id ?? '',
        name: raw.product.name ?? '',
        price: raw.product.price ?? 0,
        description: raw.product.description,
        stock: raw.product.stock,
      }
    : undefined;

  return {
    id: raw.id ?? raw._id ?? '',
    productId: raw.productId ?? raw.product_id ?? '',
    product,
    userId: raw.userId ?? raw.user_id,
    createdAt: raw.createdAt ?? raw.created_at,
  };
}

export interface PaginatedWishlist {
  items: WishlistItem[];
  total?: number;
}

export const wishlistAPI = {
  getAll: async (params?: { offset?: number; limit?: number }): Promise<PaginatedWishlist> => {
    const { offset = 0, limit = 10 } = params ?? {};
    const response = await apiClient.get('/wishlist', { params: { offset, limit } });
    const raw = extractArray(response.data);
    const items = raw.map(normalizeWishlistItem);
    const total = response.data?.total;
    return { items, total };
  },

  add: async (productId: string): Promise<WishlistItem> => {
    const response = await apiClient.post('/wishlist', { productId });
    const raw = response.data?.data ?? response.data;
    return normalizeWishlistItem(raw);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${id}`);
  },
};
