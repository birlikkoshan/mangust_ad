import apiClient from './client';

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

export const productsAPI = {
  getAll: async (categoryId?: string): Promise<Product[]> => {
    const params = categoryId ? { categoryId } : {};
    const response = await apiClient.get('/products', { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data;
  },

  create: async (data: CreateProductData): Promise<Product> => {
    const response = await apiClient.post('/products', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateProductData>): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  addReview: async (id: string, data: AddReviewData): Promise<Product> => {
    const response = await apiClient.post(`/products/${id}/reviews`, data);
    return response.data.data;
  },
};
