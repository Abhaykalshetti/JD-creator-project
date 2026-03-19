import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' = 'GET',
  data?: any,
): Promise<T> {
  try {
    const res = await axiosInstance({
      url: endpoint,
      method,
      data,
    });

    return res.data;
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message || 'Request failed',
    );
  }
}

export const api = {
  // Auth Endpoints
  register: (data: object) => request<{ user: any }>('/api/auth/register', 'POST', data),
  login: (data: object) => request<{ access_token: string }>('/api/auth/login', 'POST', data),

  // JD Endpoints
  generateJD: (data: object) =>
    request<{ generatedJD: string; variants: { label: string; jd: string }[] }>('/api/jd/generate', 'POST', data),

  suggestSkills: (data: object) =>
    request<{ skills: string[] }>('/api/jd/suggest-skills', 'POST', data),

  suggestReqQual: (data: object) =>
    request<{ responsibilities: string; qualifications: string }>('/api/jd/suggest-req-qual', 'POST', data),

  checkQuality: (generatedJD: string) =>
    request<{ score: number; grade: string; suggestions: string[] }>(
      '/api/jd/check-quality',
      'POST',
      { generatedJD },
    ),

  refineJD: (currentJD: string, instruction: string) =>
    request<{ refinedJD: string }>('/api/jd/refine', 'POST', { currentJD, instruction }),

  saveJD: (data: object) =>
    request<{ id: string }>('/api/jd/save', 'POST', data),

  getSavedJDs: () => request<any[]>('/api/jd/saved'),

  getSavedJDById: (id: string) =>
    request<any>(`/api/jd/saved/${id}`),

  deleteJD: (id: string) =>
    request<{ message: string }>(`/api/jd/saved/${id}`, 'DELETE'),
};