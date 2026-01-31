import apiClient from './client';

export interface SalesStats {
  averageOrder: number;
  cancelledOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface ProductStats {
  averageRating: number;
  outOfStock: number;
  totalCategories: number;
  totalProducts: number;
  totalReviews: number;
  totalStock: number;
}

// Helper to extract data from response (handles { data: {...} } vs {...})
function extractData(data: any): any {
  if (data && data.data) return data.data;
  return data;
}

// Helper to normalize sales stats (handles snake_case vs camelCase)
function normalizeSalesStats(raw: any): SalesStats {
  return {
    averageOrder: raw.averageOrder ?? raw.average_order ?? 0,
    cancelledOrders: raw.cancelledOrders ?? raw.cancelled_orders ?? 0,
    deliveredOrders: raw.deliveredOrders ?? raw.delivered_orders ?? 0,
    pendingOrders: raw.pendingOrders ?? raw.pending_orders ?? 0,
    shippedOrders: raw.shippedOrders ?? raw.shipped_orders ?? 0,
    totalOrders: raw.totalOrders ?? raw.total_orders ?? 0,
    totalRevenue: raw.totalRevenue ?? raw.total_revenue ?? 0,
  };
}

// Helper to normalize product stats (handles snake_case vs camelCase)
function normalizeProductStats(raw: any): ProductStats {
  return {
    averageRating: raw.averageRating ?? raw.average_rating ?? 0,
    outOfStock: raw.outOfStock ?? raw.out_of_stock ?? 0,
    totalCategories: raw.totalCategories ?? raw.total_categories ?? 0,
    totalProducts: raw.totalProducts ?? raw.total_products ?? 0,
    totalReviews: raw.totalReviews ?? raw.total_reviews ?? 0,
    totalStock: raw.totalStock ?? raw.total_stock ?? 0,
  };
}

export const statsAPI = {
  getSalesStats: async (): Promise<SalesStats> => {
    const response = await apiClient.get('/admin/stats/sales');
    const raw = extractData(response.data);
    return normalizeSalesStats(raw);
  },

  getProductStats: async (): Promise<ProductStats> => {
    const response = await apiClient.get('/admin/stats/products');
    const raw = extractData(response.data);
    return normalizeProductStats(raw);
  },
};
