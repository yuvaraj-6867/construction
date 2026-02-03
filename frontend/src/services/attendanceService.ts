import api from './api';

export interface Attendance {
  worker_id: number | string;
  project_id: number | string;
  date: string;
  status: 'present' | 'half-day' | 'absent';
  notes?: string;
}

const attendanceService = {
  getAll: async (filters?: { project_id?: string; worker_id?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (filters?.project_id) params.append('project_id', filters.project_id);
    if (filters?.worker_id) params.append('worker_id', filters.worker_id);
    if (filters?.date) params.append('date', filters.date);

    const response = await api.get(`/attendances?${params}`);
    return response.data;
  },

  create: async (data: Attendance) => {
    const response = await api.post('/attendances', { attendance: data });
    return response.data;
  },

  bulkCreate: async (attendances: Attendance[]) => {
    const response = await api.post('/attendances/bulk_create', { attendances });
    return response.data;
  },

  update: async (id: string, data: Attendance) => {
    const response = await api.put(`/attendances/${id}`, { attendance: data });
    return response.data;
  },
};

export default attendanceService;
