// 빠른 매칭 API (Spring Match_controller)
// MatchingWait / MatchingDone / QuickMatchPage 가 쓰는 함수들이에요.
//
//  GET    /api/categories           → 카테고리 목록 ('상관없음' 포함)
//  POST   /api/matches/quick        → 빠른 매칭 요청       body: { categoryId }
//  GET    /api/matches/quick/status → { status: "WAITING" | "MATCHED" | ..., matchLogId }
//  DELETE /api/matches/quick        → 매칭 대기 취소 { message }
//  GET    /api/matches/{matchLogId} → get_match_DTO
//         { matchLogId, chatRoomId, categoryName, matchLogTime,
//           partner: { userAi, userNickname, userAge, userCountry, userLocal } }

import { getAccessToken } from "./authApi";

async function request(path, options = {}) {
  const token = getAccessToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // ⚠ 백엔드 userService.get_user(token) 이 "Bearer " 를 직접 떼는지 확인해주세요.
      //   토큰 그대로 받는 구조라면 아래를 `Authorization: token` 으로 바꾸세요.
      ...(token && { Authorization: `Bearer ${token}` }),
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
    error.status = res.status; // 401 로그인 필요, 409 이미 확정 등
    throw error;
  }
  return data;
}

/** 카테고리 목록 → [{ categoryId, name }] */
export async function fetchCategories() {
  const data = await request("/categories");
  const list = Array.isArray(data) ? data : (data?.categories ?? []);
  return list.map((c) => ({
    categoryId: c.categoryId ?? c.category_id ?? c.id,
    name: c.categoryName ?? c.category_name ?? c.name,
  }));
}

/** 빠른 매칭 요청 */
export function requestQuickMatch(categoryId) {
  return request("/matches/quick", {
    method: "POST",
    body: JSON.stringify({ categoryId }),
  });
}

/** 매칭 대기 상태 조회 */
export function fetchQuickMatchStatus() {
  return request("/matches/quick/status");
}

/** 매칭 대기 취소 */
export function cancelQuickMatch() {
  return request("/matches/quick", { method: "DELETE" });
}

/** 매칭 결과(상대 정보, 채팅방) 조회 */
export function fetchMatch(matchLogId) {
  return request(`/matches/${matchLogId}`);
}

export function fetchMyMatches(page = 0, size = 20) {
  return request(`/matches/me?page=${page}&size=${size}`);
}

/** 확정 매칭 취소 DELETE /api/matches/:matchLogId */
export function cancelMatch(matchLogId) {
  return request(`/matches/${matchLogId}`, { method: "DELETE" });
}

/** 취소 후 현지인이 게시글을 다시 공개하거나 종료 */
export function decideCanceledBoard(matchLogId, boardId, action) {
  return request(`/matches/${matchLogId}/boards/${boardId}/decision`, {
    method: "PUT",
    body: JSON.stringify({ action }),
  });
}
