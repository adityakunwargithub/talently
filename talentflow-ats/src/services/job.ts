import { api } from '@/lib/api';
import type { CreateJobPayload, UpdateJobPayload } from '@/types/api';
import type { Job } from '@/types/models';

export const jobService = {
  list: () => api.get<Job[]>('/jobs').then((res) => res.data),

  get: (id: string) => api.get<Job>(`/jobs/${id}`).then((res) => res.data),

  create: (payload: CreateJobPayload) => api.post<Job>('/jobs', payload).then((res) => res.data),

  update: (id: string, payload: UpdateJobPayload) =>
    api.put<Job>(`/jobs/${id}`, payload).then((res) => res.data),

  remove: (id: string) => api.delete(`/jobs/${id}`),

  listPublic: () => api.get<Job[]>('/public/jobs').then((res) => res.data),

  getPublic: (id: string) => api.get<Job>(`/public/jobs/${id}`).then((res) => res.data),
};
