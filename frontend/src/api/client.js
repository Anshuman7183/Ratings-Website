// src/api/client.js
// Minimal API client for Roxiler backend (Vite + React)
// Uses VITE_API_URL (fallback: http://localhost:4000)
// Exposes: setToken/getToken/clearToken + endpoint helpers

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "roxiler_token";

// ---- Token helpers ----
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ---- Core fetch wrapper ----
export async function api(path, { method = "GET", body, token = getToken() } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const raw = await res.text();
  const data = raw ? tryJson(raw) : {};

  if (!res.ok) {
    const msg = (data && data.error) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}
function tryJson(s) {
  try { return JSON.parse(s); } catch { return { raw: s }; }
}

// ---- Auth ----
export async function registerUser({ name, email, password, address, role = "USER" }) {
  // Address is required by challenge spec
  return api("/auth/register", { method: "POST", body: { name, email, password, address, role } });
}
export async function loginUser({ email, password }) {
  const res = await api("/auth/login", { method: "POST", body: { email, password }, token: "" });
  if (res?.token) setToken(res.token);
  return res;
}
export async function getMe() {
  return api("/me");
}
export async function changePassword({ currentPassword, newPassword }) {
  return api("/me/password", { method: "PATCH", body: { currentPassword, newPassword } });
}

// ---- Stores ----
export async function listStores({ page = 1, limit = 10, q = "", sort = "name", order = "asc" } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(q ? { q } : {}),
    sort,
    order,
  });
  return api(`/stores?${params.toString()}`);
}
export async function getStore(id) {
  return api(`/stores/${id}`);
}
export async function createStore({ name, address }) {
  return api("/stores", { method: "POST", body: { name, address } });
}
export async function updateStore(id, { name, address, ownerId } = {}) {
  const payload = {};
  if (name !== undefined) payload.name = name;
  if (address !== undefined) payload.address = address;
  if (ownerId !== undefined) payload.ownerId = ownerId;
  return api(`/stores/${id}`, { method: "PATCH", body: payload });
}
export async function deleteStore(id) {
  return api(`/stores/${id}`, { method: "DELETE" });
}

// ---- Ratings ----
export async function rateStore(storeId, value) {
  return api(`/stores/${storeId}/ratings`, { method: "POST", body: { value } });
}
export async function listRatings(storeId) {
  return api(`/stores/${storeId}/ratings`);
}
export async function topStores(limit = 10) {
  return api(`/stores/top?limit=${limit}`);
}

// ---- Owner/Admin helpers ----
export async function ownerMineRatings() {
  return api("/stores/mine/ratings");
}
export async function adminStats() {
  return api("/admin/stats");
}
export async function adminListUsers({ q = "", role = "" } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (role) params.set("role", role);
  const qs = params.toString();
  return api(`/admin/users${qs ? `?${qs}` : ""}`);
}
export async function adminCreateUser({ name, email, password, address, role }) {
  return api("/admin/users", { method: "POST", body: { name, email, password, address, role } });
}

// ---- Convenience: ping backend ----
export async function health() {
  return api("/");
}
