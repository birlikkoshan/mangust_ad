import apiClient from "./client";

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
}

export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get("/categories");
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post("/admin/categories", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<CreateCategoryData>,
  ): Promise<Category> => {
    const response = await apiClient.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },
};
