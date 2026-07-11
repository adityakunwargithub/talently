import { Href, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { api, clearToken, getRole, getToken, setRole, setToken } from '@/lib/api';
import type {
  AdminLoginPayload,
  AuthResponse,
  CandidateLoginPayload,
  CandidateSignupPayload,
  LoginPayload,
  SignupPayload,
} from '@/types/api';
import type { User } from '@/types/models';

export async function login(payload: LoginPayload): Promise<User> {
  const { data } = await api.post<AuthResponse>('/auth/login', payload);
  await setToken(data.token);
  await setRole(data.user.role);
  return data.user;
}

export async function signup(payload: SignupPayload): Promise<User> {
  const { data } = await api.post<AuthResponse>('/auth/signup', payload);
  await setToken(data.token);
  await setRole(data.user.role);
  return data.user;
}

export async function adminLogin(payload: AdminLoginPayload): Promise<User> {
  const { data } = await api.post<AuthResponse>('/auth/admin-login', payload);
  await setToken(data.token);
  await setRole(data.user.role);
  return data.user;
}

export async function candidateLogin(payload: CandidateLoginPayload): Promise<User> {
  const { data } = await api.post<AuthResponse>('/auth/candidate-login', payload);
  await setToken(data.token);
  await setRole(data.user.role);
  return data.user;
}

export async function candidateSignup(payload: CandidateSignupPayload): Promise<User> {
  const { data } = await api.post<AuthResponse>('/auth/candidate-signup', payload);
  await setToken(data.token);
  await setRole(data.user.role);
  return data.user;
}

export async function logout(): Promise<void> {
  await clearToken();
}

/**
 * Redirects to login before render if there's no stored token, instead of
 * waiting for the first protected API call to fail with 401.
 * Returns true while the token check is in flight.
 */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getToken().then((token) => {
      if (cancelled) return;
      if (!token) {
        router.replace({ pathname: '/(auth)/login', params: { redirect: pathname } });
      } else {
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  return checking;
}

/** Same as useRequireAuth, but also requires the stored role to be ADMIN. */
export function useRequireAdmin(): boolean {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getToken(), getRole()]).then(([token, role]) => {
      if (cancelled) return;
      if (!token || role !== 'ADMIN') {
        router.replace('/admin/login');
      } else {
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return checking;
}

// Typed-route generation lags behind newly added files, so these are asserted rather
// than statically checked — all three are real, valid runtime routes.
const HOME_HREF_BY_ROLE: Record<string, Href> = {
  ADMIN: '/admin/users' as Href,
  RECRUITER: '/(dashboard)' as Href,
  CANDIDATE: '/careers' as Href,
};

/** Resolves the "home" destination for the home-icon button based on the logged-in role. */
export function useHomeHref(): Href {
  const [href, setHref] = useState<Href>('/');

  useEffect(() => {
    let cancelled = false;
    getRole().then((role) => {
      if (cancelled) return;
      setHref((role && HOME_HREF_BY_ROLE[role]) || '/');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return href;
}
