import apiClient from './Admin/client';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
}

function extractData(data: any): any {
  if (data && data.data) return data.data;
  return data;
}

function normalizeProfile(raw: any): Profile {
  return {
    id: raw.id ?? raw._id ?? '',
    email: raw.email ?? '',
    name: raw.name ?? '',
    role: raw.role ?? 'user',
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}

export const profileAPI = {
  get: async (): Promise<Profile> => {
    const response = await apiClient.get('/profile');
    const raw = extractData(response.data);
    return normalizeProfile(raw);
  },

  update: async (data: UpdateProfileData): Promise<Profile> => {
    const response = await apiClient.put('/profile', data);
    const raw = extractData(response.data);
    return normalizeProfile(raw);
  },
};
