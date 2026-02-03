import api from './api';

export interface Payment {
  id?: number;
  worker_id: number | string;
  project_id: number | string;
  amount: number | string;
  payment_date: string;
  payment_method: string;
  notes?: string;
}

const paymentService = {
  getAll: async (workerId?: number | string, projectId?: number | string) => {
    let url = '/payments';
    const params: string[] = [];
    if (workerId) params.push(`worker_id=${workerId}`);
    if (projectId) params.push(`project_id=${projectId}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  create: async (data: Partial<Payment>) => {
    const response = await api.post('/payments', { payment: data });
    return response.data;
  },

  update: async (id: string, data: Partial<Payment>) => {
    const response = await api.put(`/payments/${id}`, { payment: data });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  }
};

export default paymentService;