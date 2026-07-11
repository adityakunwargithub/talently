import { api } from '@/lib/api';
import type { AdminUsersResponse, UpdateAdminUserPayload } from '@/types/api';
import type { AdminUserRow, AdminUserType } from '@/types/models';

export const adminService = {
  listUsers: (params: { search?: string; page: number; pageSize: number }) =>
    api.get<AdminUsersResponse>('/admin/users', { params }).then((res) => res.data),

  updateUser: (type: AdminUserType, id: string, payload: UpdateAdminUserPayload) =>
    api.put<AdminUserRow>(`/admin/users/${type}/${id}`, payload).then((res) => res.data),

  deleteUser: (type: AdminUserType, id: string) => api.delete(`/admin/users/${type}/${id}`),
};
