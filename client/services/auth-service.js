import { API_BASE } from '../config.js';

const AUTH_KEY = 'donezo_token';
const EMAIL_KEY = 'donezo_email';
export const AUTH_PAGE = '/pages/auth/auth.html';

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Login failed');
  }
  const { token } = await res.json();
  localStorage.setItem(AUTH_KEY, token);
  localStorage.setItem(EMAIL_KEY, email);
}

export async function register(email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error ?? 'Registration failed');
  }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(EMAIL_KEY);
  window.location.href = AUTH_PAGE;
}

export function getUserEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export function getToken() {
  return localStorage.getItem(AUTH_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}