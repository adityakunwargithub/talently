import { api } from '@/lib/api';
import type { ApplyToJobPayload, UpdateApplicationStatusPayload } from '@/types/api';
import type { Application } from '@/types/models';

export const applicationService = {
  list: (jobId?: string) =>
    api.get<Application[]>('/applications', { params: jobId ? { jobId } : undefined }).then((res) => res.data),

  get: (id: string) => api.get<Application>(`/applications/${id}`).then((res) => res.data),

  updateStatus: (id: string, payload: UpdateApplicationStatusPayload) =>
    api.put<Application>(`/applications/${id}/status`, payload).then((res) => res.data),

  submitToJob: (jobId: string, payload: ApplyToJobPayload) =>
    api.post<Application>(`/public/jobs/${jobId}/apply`, payload).then((res) => res.data),

  /** Uploads a PDF resume to the backend and returns its extracted text. */
  parseResume: (file: File | { uri: string; name: string; mimeType?: string }) => {
    const formData = new FormData();
    if (typeof File !== 'undefined' && file instanceof File) {
      formData.append('resume', file, file.name);
    } else {
      const asset = file as { uri: string; name: string; mimeType?: string };
      formData.append('resume', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/pdf',
      } as unknown as Blob);
    }
    return api.post<{ text: string }>('/public/parse-resume', formData).then((res) => res.data.text);
  },
};
