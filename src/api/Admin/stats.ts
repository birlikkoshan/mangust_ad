import apiClient from './client';

export interface SalesStat {
  category: string;
  totalRevenue: number;
  totalQuantity: number;
  orderCount: number;
}

export interface ProductStat {
  name: string;
  price: number;
  stock: number;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
}

// Helper to extract array from response (handles { data: [...] } vs [...])
function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

// Helper to normalize sales stat (handles snake_case vs camelCase)
function normalizeSalesStat(raw: any): SalesStat {
  return {
    category: raw.category ?? raw._id ?? "",
    totalRevenue: raw.totalRevenue ?? raw.total_revenue ?? 0,
    totalQuantity: raw.totalQuantity ?? raw.total_quantity ?? 0,
    orderCount: raw.orderCount ?? raw.order_count ?? 0,
  };
}

// Helper to normalize product stat (handles snake_case vs camelCase)
function normalizeProductStat(raw: any): ProductStat {
  return {
    name: raw.name ?? "",
    price: raw.price ?? 0,
    stock: raw.stock ?? 0,
    categoryName: raw.categoryName ?? raw.category_name ?? "",
    averageRating: raw.averageRating ?? raw.average_rating ?? 0,
    reviewCount: raw.reviewCount ?? raw.review_count ?? 0,
  };
}

export const statsAPI = {
  getSalesStats: async (): Promise<SalesStat[]> => {
    const response = await apiClient.get('/admin/stats/sales');
    const raw = extractArray(response.data);
    return raw.map(normalizeSalesStat);
  },

  getProductStats: async (): Promise<ProductStat[]> => {
    const response = await apiClient.get('/admin/stats/products');
    const raw = extractArray(response.data);
    return raw.map(normalizeProductStat);
  },
};
