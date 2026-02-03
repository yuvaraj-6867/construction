import api from './api';

export interface Worker {
  id?: string;
  name: string;
  phone: string;
  role: string;
  daily_wage: number | string;
  project_id: number | string;
  address?: string;
  advance_given?: number | string;
  status?: string;
  is_active?: boolean;
  joined_date?: string;
}

const workerService = {
  getAll: async (projectId?: string | number) => {
    const url = projectId ? `/workers?project_id=${projectId}` : '/workers';
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/workers/${id}`);
    return response.data;
  },

  create: async (data: Partial<Worker>) => {
    const response = await api.post('/workers', { worker: data });
    return response.data;
  },

  update: async (id: string, data: Partial<Worker>) => {
    const response = await api.put(`/workers/${id}`, { worker: data });
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/workers/${id}`);
  },
};

export default workerService;
