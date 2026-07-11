import { api } from '@/lib/api';
import type { ScreeningResult } from '@/types/models';

/**
 * Triggers server-side screening for an application. The backend currently scores
 * resume/requirement keyword overlap (see backend/src/services/ai-screening.ts);
 * swap in a real AI provider there without changing this client call.
 */
export const aiScreeningService = {
  screen: (applicationId: string) =>
    api.post<ScreeningResult>(`/applications/${applicationId}/screen`).then((res) => res.data),
};
