// 회원 API (Spring 백엔드)
// 개발 중에는 vite.config.js 의 proxy 로 /api → Spring 서버로 전달해요.

const BASE = "/api/users";

async function request(path, options = {}) {
  const token = getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // 본문이 비어 있거나 JSON 이 아니어도 죽지 않게 처리해요
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error = new Error(data?.message || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

/** 아이디 중복확인  GET /api/users/check-id?userId=
 *  → "available" | "taken" | "invalid" (그 외 오류는 throw) */
export async function checkId(userId) {
  try {
    const data = await request(
      `/check-id?userId=${encodeURIComponent(userId)}`,
    );
    return data.available ? "available" : "taken";
  } catch (e) {
    if (e.status === 400) return "invalid"; // 아이디 형식 오류
    throw e;
  }
}

/** 회원가입  POST /api/users/signup
 *  성공 201 { message } / 실패 400 필수값 누락, 409 이미 존재하는 아이디 */
export function signup(body) {
  return request("/signup", { method: "POST", body: JSON.stringify(body) });
}

export function fetchMe() {
  return request("/me");
}

export function updateMe(body) {
  return request("/me", { method: "PATCH", body: JSON.stringify(body) });
}

export async function logout() {
  await request("/logout", { method: "POST" });
  clearAuth();
}

/** 로그인  POST /api/users/login
 *  성공 200 { accessToken, userAi, userNickname, userLocal } / 실패 401 */
export async function login(userId, userPw) {
  const data = await request("/login", {
    method: "POST",
    body: JSON.stringify({ userId, userPw }),
  });
  saveAuth(data);
  return data;
}

// ---- 로그인 정보 보관 (localStorage) ----
const KEY = "itadakko_auth";

export function saveAuth({ accessToken, userAi, userNickname, userLocal }) {
  localStorage.setItem(
    KEY,
    JSON.stringify({ accessToken, userAi, userNickname, userLocal }),
  );
}

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return getAuth()?.accessToken ?? null;
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}
