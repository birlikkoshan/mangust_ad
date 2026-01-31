import apiClient from "./client";

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
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
    imageUrl: raw.imageUrl ?? raw.image_url ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
  };
}

// Helper to extract array from response (handles { data: [...] } vs { items: [...] } vs [...])
function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export interface PaginatedCategories {
  items: Category[];
  total?: number;
}

export const categoriesAPI = {
  getAll: async (params?: { offset?: number; limit?: number }): Promise<PaginatedCategories> => {
    const { offset = 0, limit = 10 } = params ?? {};
    const response = await apiClient.get("/categories", { params: { offset, limit } });
    const data = response.data ?? {};
    const raw = Array.isArray(data.items) ? data.items : extractArray(data);
    const items = raw.map(normalizeCategory);
    const total = data.total ?? data.total_count;
    return { items, total };
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




