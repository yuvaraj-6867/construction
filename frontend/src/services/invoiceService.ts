import api from './api';

export interface Invoice {
  id?: number;
  project_id: number | string;
  invoice_number: string;
  amount: number | string;
  issue_date: string;
  due_date?: string;
  status: string;
  payment_date?: string;
  notes?: string;
}

const invoiceService = {
  getAll: async (projectId?: number | string) => {
    let url = '/invoices';
    if (projectId) url += `?project_id=${projectId}`;
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  create: async (data: Partial<Invoice>) => {
    const response = await api.post('/invoices', { invoice: data });
    return response.data;
  },

  update: async (id: string, data: Partial<Invoice>) => {
    const response = await api.put(`/invoices/${id}`, { invoice: data });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  }
};

export default invoiceService;
