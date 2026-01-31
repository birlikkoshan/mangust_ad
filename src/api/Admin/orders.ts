import apiClient from './client';
import { extractPaginatedItems, extractTotal } from './paginatedResponse';

export interface OrderItem {
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;      // unit price (optional from API)
  lineTotal?: number; // total for this line (price × quantity)
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

  const quantity = raw.quantity ?? 0;
  const lineTotal = raw.lineTotal ?? raw.line_total;
  const price = raw.price ?? raw.unitPrice ?? raw.unit_price;
  // Derive unit price from lineTotal if missing
  const unitPrice = price ?? (quantity > 0 && lineTotal != null ? lineTotal / quantity : 0);
  const lineTotalValue = lineTotal ?? (unitPrice * quantity);

  return {
    productId: raw.productId ?? raw.product_id ?? "",
    product,
    quantity,
    price: unitPrice,
    lineTotal: lineTotalValue,
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
    total: raw.totalPrice ?? raw.total_price ?? raw.total ?? 0,
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
    const data = response.data ?? {};
    const raw = extractPaginatedItems(data);
    const items = (Array.isArray(raw) ? raw : []).map(normalizeOrder);
    const total = extractTotal(data);
    return { items, total };
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    const raw = response.data?.data ?? response.data?.order ?? response.data;
    return normalizeOrder(raw ?? {});
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
    const data = response.data ?? {};
    const raw = extractPaginatedItems(data);
    const items = (Array.isArray(raw) ? raw : []).map(normalizeOrder);
    const total = extractTotal(data);
    return { items, total };
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },
};
