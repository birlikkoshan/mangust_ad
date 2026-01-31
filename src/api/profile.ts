import apiClient from './Admin/client';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
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
    avatar: raw.avatar ?? raw.photo ?? raw.image,
    phone: raw.phone ?? raw.phoneNumber,
    address: raw.address ?? raw.location,
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
    const payload: Record<string, string | undefined> = {};
    if (data.name != null) payload.name = data.name;
    if (data.email != null) payload.email = data.email;
    if (data.password != null) payload.password = data.password;
    if (data.phone != null) payload.phone = data.phone;
    if (data.address != null) payload.address = data.address;
    const response = await apiClient.put('/profile', payload);
    const raw = extractData(response.data);
    return normalizeProfile(raw);
  },
};
