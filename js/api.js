const API_BASE = window.MEETFLOW_API_BASE || '/api';

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('meetflowToken');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'The request could not be completed.');
  return payload;
}

window.MeetFlowAPI = { request: apiRequest, setToken: token => sessionStorage.setItem('meetflowToken', token), clearToken: () => sessionStorage.removeItem('meetflowToken'), getToken: () => sessionStorage.getItem('meetflowToken') };
