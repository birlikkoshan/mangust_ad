import apiClient from "./client";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
}

export interface AddReviewData {
  rating: number;
  comment: string;
}

// Helper to extract array from response (handles { data: [...] } vs [...])
function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

// Helper to normalize review
function normalizeReview(raw: any): Review {
  return {
    id: raw.id ?? raw._id ?? "",
    userId: raw.userId ?? raw.user_id ?? "",
    userName: raw.userName ?? raw.user_name ?? "",
    rating: raw.rating ?? 0,
    comment: raw.comment ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? "",
  };
}

// Helper to normalize product from backend (handles _id vs id, snake_case vs camelCase)
function normalizeProduct(raw: any): Product {
  const category = raw.category
    ? {
        id: raw.category.id ?? raw.category._id ?? "",
        name: raw.category.name ?? "",
      }
    : undefined;

  const reviews = Array.isArray(raw.reviews)
    ? raw.reviews.map(normalizeReview)
    : [];

  return {
    id: raw.id ?? raw._id ?? "",
    name: raw.name ?? "",
    description: raw.description ?? "",
    price: raw.price ?? 0,
    stock: raw.stock ?? 0,
    categoryId: raw.categoryId ?? raw.category_id ?? "",
    category,
    reviews,
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
  };
}

export const productsAPI = {
  getAll: async (categoryId?: string): Promise<Product[]> => {
    const params = categoryId ? { categoryId } : {};
    const response = await apiClient.get('/products', { params });
    const raw = extractArray(response.data);
    return raw.map(normalizeProduct);
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return normalizeProduct(response.data);
  },

  create: async (data: CreateProductData): Promise<Product> => {
    const response = await apiClient.post('/admin/products', data);
    return normalizeProduct(response.data);
  },

  update: async (id: string, data: Partial<CreateProductData>): Promise<Product> => {
    const response = await apiClient.put(`/admin/products/${id}`, data);
    return normalizeProduct(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },

  addReview: async (id: string, data: AddReviewData): Promise<Product> => {
    const response = await apiClient.post(`/admin/products/${id}/reviews`, data);
    return normalizeProduct(response.data);
  },
};
