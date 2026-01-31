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
    categoryId?: string;
    category?: { name: string; imageUrl?: string };
  };
  userId?: string;
  createdAt?: string;
}

function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.items)) return data.items;
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
        categoryId: raw.product.categoryId ?? raw.product.category_id,
        category: raw.product.category
          ? { name: raw.product.category.name ?? '', imageUrl: raw.product.category.imageUrl ?? raw.product.category.image_url }
          : undefined,
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
    const total = response.data?.total ?? response.data?.total_count;
    return { items, total };
  },

  add: async (productId: string): Promise<WishlistItem> => {
    const response = await apiClient.post('/wishlist', { product_id: productId, productId });
    const raw = response.data?.data ?? response.data;
    return normalizeWishlistItem(raw);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${id}`);
  },
};
