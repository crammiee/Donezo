// POST /auth/login and /auth/register API calls
const AUTH_KEY = 'donezo_token';
const API_BASE = 'http://localhost:3000';
export const AUTH_PAGE = '/pages/auth/auth.html';

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok){
    const { message } = await res.json();
    throw new Error(message ?? 'Login failed');
  }
  localStorage.setItem(AUTH_KEY, token);
}

export async function register(email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok){
    const { message } = await res.json();
    throw new Error(message ?? 'Registration failed');
  }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = AUTH_PAGE;
}

export function getToken() {
  return localStorage.getItem(AUTH_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}