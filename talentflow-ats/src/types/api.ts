import { AdminUserRow, ApplicationStatus, Job, JobStatus, User } from './models';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
}

export interface AdminLoginPayload {
  username: string;
  password: string;
}

export interface CandidateLoginPayload {
  username: string;
  password: string;
}

export interface CandidateSignupPayload {
  username: string;
  password: string;
  name: string;
  email: string;
}

export interface AdminUsersResponse {
  rows: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateAdminUserPayload {
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  requirements: string;
  location: string;
  department: string;
  employmentType: string;
  status?: JobStatus;
}

export type UpdateJobPayload = Partial<CreateJobPayload>;

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
}

export interface AddNotePayload {
  applicationId: string;
  text: string;
}

export interface ApplyToJobPayload {
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  resumeText?: string;
}

export interface ApiErrorResponse {
  error: string;
}

export type PublicJob = Job;
