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


// Helper to normalize order item
function normalizeOrderItem(raw: any): OrderItem {
  const product = raw.product
    ? {
        id: raw.product.id ?? raw.product._id ?? "",
        name: raw.product.name ?? "",
        price: raw.product.price ?? 0,
      }
    : undefined;

  return {
    productId: raw.productId ?? raw.product_id ?? "",
    product,
    quantity: raw.quantity ?? 0,
    price: raw.price ?? 0,
  };
}

// Helper to normalize order from backend (handles _id vs id, snake_case vs camelCase)
function normalizeOrder(raw: any): Order {
  const user = raw.user
    ? {
        id: raw.user.id ?? raw.user._id ?? "",
        name: raw.user.name ?? "",
        email: raw.user.email ?? "",
      }
    : undefined;

  const items = Array.isArray(raw.items)
    ? raw.items.map(normalizeOrderItem)
    : [];

  return {
    id: raw.id ?? raw._id ?? "",
    userId: raw.userId ?? raw.user_id ?? "",
    user,
    items,
    total: raw.total ?? 0,
    status: raw.status ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
  };
}

export interface PaginatedOrders {
  items: Order[];
  total?: number;
}

export interface FindOrdersParams {
  orderId?: string;
  userId?: string;
  status?: string;
  offset?: number;
  limit?: number;
}

export const ordersAPI = {
  getAll: async (params?: { offset?: number; limit?: number }): Promise<PaginatedOrders> => {
    const { offset = 0, limit = 10 } = params ?? {};
    const response = await apiClient.get('/orders', { params: { offset, limit } });
    const raw = response.data?.data ?? response.data;
    const items = Array.isArray(raw) ? raw.map(normalizeOrder) : [];
    const total = response.data?.total ?? (Array.isArray(response.data) ? undefined : response.data?.total);
    return { items, total };
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    const raw = response.data?.data ?? response.data;
    return normalizeOrder(raw);
  },

  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/orders', data);
    return normalizeOrder(response.data);
  },

  updateStatus: async (id: string, data: UpdateOrderStatusData): Promise<Order> => {
    const response = await apiClient.put(`/admin/orders/${id}/status`, data);
    return normalizeOrder(response.data);
  },

  find: async (params: FindOrdersParams): Promise<PaginatedOrders> => {
    const response = await apiClient.post('/admin/orders/find', params);
    const raw = response.data?.data ?? response.data;
    const items = Array.isArray(raw) ? raw.map(normalizeOrder) : [];
    const total = response.data?.total;
    return { items, total };
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },
};
