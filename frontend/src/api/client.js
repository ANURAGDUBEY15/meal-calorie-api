export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
