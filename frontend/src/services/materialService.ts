import api from './api';

export interface Material {
  id?: number;
  project_id: number | string;
  name: string;
  quantity: number | string;
  unit: string;
  unit_price: number | string;
  total_cost: number | string;
  supplier_name?: string;
  purchase_date: string;
  notes?: string;
}

const materialService = {
  getAll: async (projectId?: number | string) => {
    let url = '/materials';
    if (projectId) url += `?project_id=${projectId}`;
    const response = await api.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/materials/${id}`);
    return response.data;
  },

  create: async (data: Partial<Material>) => {
    const response = await api.post('/materials', { material: data });
    return response.data;
  },

  update: async (id: string, data: Partial<Material>) => {
    const response = await api.put(`/materials/${id}`, { material: data });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/materials/${id}`);
    return response.data;
  }
};

export default materialService;
