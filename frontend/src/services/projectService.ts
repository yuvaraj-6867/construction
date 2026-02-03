import api from './api';

export interface Project {
  id?: string;
  name: string;
  client_name: string;
  location: string;
  budget: number | string;
  start_date: string;
  end_date?: string;
  status: string;
  description?: string;
}

const projectService = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data: Partial<Project>) => {
    const response = await api.post('/projects', { project: data });
    return response.data;
  },

  update: async (id: string, data: Partial<Project>) => {
    const response = await api.put(`/projects/${id}`, { project: data });
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/projects/${id}`);
  },
};

export default projectService;
