/**
 * Base URL for the API, configurable via environment variable.
 * Defaults to localhost if not provided.
 * @constant {string}
 */
export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

/**
 * Generic helper to make API calls with JSON body and authorization header.
 *
 * @param {string} path - The API endpoint path (e.g., "/auth/login").
 * @param {Object} [options={}] - Fetch options (method, body, headers, etc.).
 * @returns {Promise<any>} - Resolves with parsed JSON response from the API.
 *
 * @throws {Error} Throws an error if the response is not ok (status outside 200-299).
 */
export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json();
}
