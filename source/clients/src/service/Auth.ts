const AUTH_KEY = 'pbf_auth';

export interface AuthCredentials {
  email: string;
  _e: string;
}

export function getAuth(): AuthCredentials | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuth(email: string, _e: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ email, _e }));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}
