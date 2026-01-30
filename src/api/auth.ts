import apiClient, { CurrentUser, UserRole } from './Admin/client';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Backend login response structure: { access_token, user }
export interface LoginResponse {
  access_token: string;
  user: CurrentUser;
}

// Backend register response might have different structure
export interface AuthResponse {
  message?: string;
  data?: {
    user: CurrentUser;
    token?: string;
    access_token?: string;
  };
  // Or flat structure for login
  access_token?: string;
  user?: CurrentUser;
}

export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
  
  registerAdmin: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/admin/auth/register', data);
    return response.data;
  },

  /**
   * Helper to check if the current user is admin on the client-side.
   * Relies on the `user` object saved to localStorage after login.
   */
  isAdmin: (): boolean => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return false;
      const user = JSON.parse(raw) as { role?: UserRole };
      return user.role === 'admin';
    } catch {
      return false;
    }
  },
};
