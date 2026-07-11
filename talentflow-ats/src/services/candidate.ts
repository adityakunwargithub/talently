import { api } from '@/lib/api';
import type { AddNotePayload } from '@/types/api';
import type { Candidate, Note } from '@/types/models';

export const candidateService = {
  list: () => api.get<Candidate[]>('/candidates').then((res) => res.data),

  get: (id: string) => api.get<Candidate>(`/candidates/${id}`).then((res) => res.data),

  addNote: (candidateId: string, payload: AddNotePayload) =>
    api.post<Note>(`/candidates/${candidateId}/notes`, payload).then((res) => res.data),
};
