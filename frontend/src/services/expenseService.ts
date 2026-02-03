import api from './api';

export interface Expense {
  id?: number;
  project_id: number | string;
  category: string;
  description: string;
  amount: number | string;
  expense_date: string;
  payment_method?: string;
  notes?: string;
}

const expenseService = {
  getAll: async (projectId?: number | string) => {
    let url = '/expenses';
    if (projectId) url += `?project_id=${projectId}`;
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  create: async (data: Partial<Expense>) => {
    const response = await api.post('/expenses', { expense: data });
    return response.data;
  },

  update: async (id: string, data: Partial<Expense>) => {
    const response = await api.put(`/expenses/${id}`, { expense: data });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};

export default expenseService;
