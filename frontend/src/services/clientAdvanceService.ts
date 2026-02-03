import api from './api';

export interface ClientAdvance {
  id?: number;
  project_id: number | string;
  amount: number | string;
  received_date: string;
  payment_method?: string;
  notes?: string;
}

const clientAdvanceService = {
  getAll: async (projectId?: number | string) => {
    let url = '/client_advances';
    if (projectId) url += `?project_id=${projectId}`;
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/client_advances/${id}`);
    return response.data;
  },

  create: async (data: Partial<ClientAdvance>) => {
    const response = await api.post('/client_advances', { client_advance: data });
    return response.data;
  },

  update: async (id: string, data: Partial<ClientAdvance>) => {
    const response = await api.put(`/client_advances/${id}`, { client_advance: data });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/client_advances/${id}`);
    return response.data;
  }
};

export default clientAdvanceService;
