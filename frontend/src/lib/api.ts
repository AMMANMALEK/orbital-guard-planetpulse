import axios from 'axios';

const STORAGE_KEY = 'planetpulse_auth';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  // No withCredentials – backend uses allow_origins=* which disallows credentials
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const token = data?.token;
      // Skip test-tokens – they're not valid JWTs but we still attach them
      // so the backend can see there's an Authorization header (optional)
      if (token && !token.startsWith('test-token-')) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore parse errors
  }
  return config;
});

// Handle 401 – only redirect to login when NOT using demo (test) mode
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : null;
        const isTestMode = data?.token?.startsWith('test-token-');
        if (!isTestMode) {
          localStorage.removeItem(STORAGE_KEY);
          if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
            window.location.href = '/login';
          }
        }
      } catch {
        // ignore
      }
    }
    return Promise.reject(err);
  }
);

export default api;

/**
 * Safely extract a human-readable error message from any Axios error.
 * Handles FastAPI 422 validation arrays, plain string details, and unknown shapes.
 */
export function getErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  try {
    const detail = (err as any)?.response?.data?.detail;
    if (!detail) return fallback;
    // FastAPI 422 validation: detail is an array of {msg, loc, ...}
    if (Array.isArray(detail)) {
      return detail.map((d: any) => (typeof d === 'string' ? d : d?.msg ?? JSON.stringify(d))).join('; ');
    }
    // Plain string detail
    if (typeof detail === 'string') return detail;
    // Object or other
    return JSON.stringify(detail);
  } catch {
    return fallback;
  }
}
