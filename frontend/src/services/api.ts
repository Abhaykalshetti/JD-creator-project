import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/jd';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  generateJD: (data: object) =>
    request<{ generatedJD: string; variants: { label: string; jd: string }[] }>('/generate', 'POST', data),

  suggestSkills: (data: object) =>
    request<{ skills: string[] }>('/suggest-skills', 'POST', data),

  suggestReqQual: (data: object) =>
    request<{ responsibilities: string; qualifications: string }>('/suggest-req-qual', 'POST', data),

  checkQuality: (generatedJD: string) =>
    request<{ score: number; grade: string; suggestions: string[] }>(
      '/check-quality',
      'POST',
      { generatedJD },
    ),

  refineJD: (currentJD: string, instruction: string) =>
    request<{ refinedJD: string }>('/refine', 'POST', { currentJD, instruction }),

  saveJD: (data: object) =>
    request<{ id: string }>('/save', 'POST', data),

  getSavedJDs: () => request<any[]>('/saved'),

  getSavedJDById: (id: string) =>
    request<any>(`/saved/${id}`),

  deleteJD: (id: string) =>
    request<{ message: string }>(`/saved/${id}`, 'DELETE'),
};