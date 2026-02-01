import apiClient from "./client";
import { extractPaginatedItems, extractTotal } from "./paginatedResponse";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  address?: string;
  phone?: string;
  bio?: string;
}

function normalizeUser(raw: any): AdminUser {
  return {
    id: raw.id ?? raw._id ?? "",
    name: raw.name ?? raw.username ?? "",
    email: raw.email ?? "",
    role: raw.role ?? "user",
    address: raw.address ?? "",
    phone: raw.phone ?? "",
    bio: raw.bio ?? "",
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}

export interface PaginatedUsers {
  items: AdminUser[];
  total?: number;
}

export const usersAPI = {
  getAll: async (): Promise<AdminUser> => {
    const response = await apiClient.get("/users");
    const data = response?.data?.data ?? response?.data;
    return normalizeUser(data ?? {});
  },

  /** Admin: list all users from GET /admin/users (no filtering) */
  getAllAdmin: async (): Promise<PaginatedUsers> => {
    const response = await apiClient.get("/admin/users");
    const data = response.data ?? {};
    const raw = extractPaginatedItems(data);
    const items = (Array.isArray(raw) ? raw : []).map(normalizeUser);
    const total = extractTotal(data);
    return { items, total };
  },
};
