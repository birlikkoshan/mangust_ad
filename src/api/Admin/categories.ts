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

// Helper to normalize category from backend (handles _id vs id, snake_case vs camelCase)
function normalizeCategory(raw: any): Category {
  return {
    id: raw.id ?? raw._id ?? "",
    name: raw.name ?? "",
    description: raw.description ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
  };
}

// Helper to extract array from response (handles { data: [...] } vs [...])
function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get("/categories");
    const raw = extractArray(response.data);
    return raw.map(normalizeCategory);
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    const raw = response.data?.data ?? response.data;
    return normalizeCategory(raw);
  },

  create: async (data: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post("/admin/categories", data);
    const raw = response.data?.data ?? response.data;
    return normalizeCategory(raw);
  },

  update: async (
    id: string,
    data: Partial<CreateCategoryData>,
  ): Promise<Category> => {
    const response = await apiClient.put(`/admin/categories/${id}`, data);
    const raw = response.data?.data ?? response.data;
    return normalizeCategory(raw);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },
};




