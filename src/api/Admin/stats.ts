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

export const statsAPI = {
  getSalesStats: async (): Promise<SalesStat[]> => {
    const response = await apiClient.get('/stats/sales');
    return response.data.data;
  },

  getProductStats: async (): Promise<ProductStat[]> => {
    const response = await apiClient.get('/stats/products');
    return response.data.data;
  },
};
