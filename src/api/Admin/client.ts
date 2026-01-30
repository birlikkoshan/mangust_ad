import axios from "axios";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  "http://localhost:8080/api/v1";

export type UserRole = "admin" | "user";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Safely read current user from localStorage.
 */
export const getCurrentUser = (): CurrentUser | null => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.role === "string"
    ) {
      return parsed as CurrentUser;
    }
  } catch {
    // ignore JSON errors and treat as not logged in
  }

  return null;
};

/**
 * Convenience helper to get current user role.
 */
export const getCurrentUserRole = (): UserRole | null => {
  const user = getCurrentUser();
  return user?.role ?? null;
};

/**
 * Notify the app that auth / role has changed.
 * Used after login / logout to trigger re-computation of isAdmin.
 */
export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event("auth-changed"));
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add access_token to requests
apiClient.interceptors.request.use(
  (config) => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default apiClient;
