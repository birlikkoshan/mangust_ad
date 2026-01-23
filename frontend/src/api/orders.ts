import apiClient from './client';

export interface OrderItem {
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusData {
  status: string;
}

export const ordersAPI = {
  getAll: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders');
    return response.data.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.data;
  },

  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return response.data.data;
  },

  updateStatus: async (id: string, data: UpdateOrderStatusData): Promise<Order> => {
    const response = await apiClient.put(`/orders/${id}/status`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },
};
