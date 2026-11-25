import { getAccessToken } from "./authApi";

async function request(path, options = {}) {
  const token = getAccessToken();
  const response = await fetch(`/api/notifications${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!response.ok) {
    const error = new Error(data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export function fetchUnreadNotifications() {
  return request("/me");
}

export function markNotificationRead(notificationId) {
  return request(`/${notificationId}/read`, { method: "POST" });
}
