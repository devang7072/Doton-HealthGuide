/**
 * api.js — Centralised fetch wrapper for the Doton backend API
 * All requests go through here so JWT token is automatically attached.
 */

const API_BASE = 'http://localhost:5000/api';

/**
 * apiFetch — wraps fetch with auth headers and JSON parsing.
 * @param {string} endpoint  - e.g. '/reminders'
 * @param {object} options   - fetch options (method, body, etc.)
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('doton_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `API Error ${res.status}`);
  }

  return data;
}

// ── Convenience wrappers ─────────────────────────────────────────
const api = {
  get   : (url)          => apiFetch(url),
  post  : (url, body)    => apiFetch(url, { method: 'POST', body: JSON.stringify(body) }),
  put   : (url, body)    => apiFetch(url, { method: 'PUT',  body: JSON.stringify(body) }),
  patch : (url, body)    => apiFetch(url, { method: 'PATCH',body: JSON.stringify(body) }),
  delete: (url)          => apiFetch(url, { method: 'DELETE' }),
};
