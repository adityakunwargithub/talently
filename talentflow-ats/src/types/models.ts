export type Role = 'RECRUITER' | 'ADMIN' | 'CANDIDATE';

export type AdminUserType = 'RECRUITER' | 'ADMIN' | 'CANDIDATE';

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export type ApplicationStatus = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';

export interface User {
  id: string;
  email?: string | null;
  username?: string | null;
  name: string;
  role: Role;
}

/** A row in the admin user-management table — unifies User (recruiter/admin) and Candidate records. */
export interface AdminUserRow {
  id: string;
  type: AdminUserType;
  name: string;
  identifier: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  department: string;
  employmentType: string;
  status: JobStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  resumeUrl?: string | null;
  resumeText?: string | null;
  createdAt: string;
  applications?: Application[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  score?: number | null;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  candidate?: Candidate;
  notes?: Note[];
}

export interface Note {
  id: string;
  applicationId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface ScreeningResult extends Application {
  matchedKeywords: string[];
  requiredKeywords: string[];
}
