// 게시글 API 모듈
// 백엔드 응답은 board 테이블 + user/category JOIN 결과를 가정합니다.
//
// board 테이블          → 응답 필드
// ------------------------------------------------
// board_id              → boardId
// user_id               → userId
// category_id           → categoryId
// board_time            → boardTime (ISO 문자열)
// board_text            → boardText
// (JOIN) category.name  → categoryName
// (JOIN) user.nickname  → nickname
// (JOIN) user.gender    → gender
// (JOIN) user.age       → age
//
// ⚠ board 테이블에 제목 컬럼이 없습니다. 목록 화면에는 제목이 있으므로
//    board_title 컬럼 추가를 권장합니다. (응답 필드: title)

import { getAccessToken } from "./authApi";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const MOCK_BOARD = {
  boardId: 2,
  userId: 10,
  categoryId: 3,
  categoryName: "일식",
  title: "오사카 도톤보리 먹방 메이트 구합니다 (12/3~12/6)",
  nickname: "배고픈 여우",
  gender: "여성",
  age: 27,
  boardTime: "2026-11-22T14:30:00+09:00",
  boardText:
    "12/3부터 12/6까지 오사카에 머무는 동안 같이 먹방 다니실 분을 찾고 있어요.\n" +
    "도톤보리에서 타코야키, 오코노미야키, 쿠시카츠 위주로 돌아다닐 예정이에요.\n" +
    "일정과 식당은 매칭 후 채팅방에서 편하게 정해요!",
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url, options) {
  const token = getAccessToken();
  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
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

/** 공개 중인 모집글 GET /api/boards */
export function fetchBoards(page = 0, size = 20) {
  return request(`/api/boards?page=${page}&size=${size}`);
}

/** 로그인한 사용자의 모집글 목록 GET /api/boards/me */
export function fetchMyBoards() {
  return request("/api/boards/me");
}

/** 모집글 작성 POST /api/boards */
export function createBoard(body) {
  return request("/api/boards", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** 모집글 수정 PUT /api/boards/:boardId */
export function updateBoard(boardId, body) {
  return request(`/api/boards/${boardId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** 모집글 삭제 DELETE /api/boards/:boardId */
export function deleteBoard(boardId) {
  return request(`/api/boards/${boardId}`, { method: "DELETE" });
}

/** 게시글 상세 조회  GET /api/boards/:boardId */
export async function fetchBoardDetail(boardId) {
  if (USE_MOCK) {
    await delay(300);
    return { ...MOCK_BOARD, boardId: Number(boardId) };
  }
  return request(`/api/boards/${boardId}`);
}

/**
 * 참여요청  POST /api/boards/:boardId/join
 * 성공 시 즉시 매칭 + 채팅방 생성 → { chatRoomId } 반환을 가정
 * 이미 다른 식사에 참여 중이면 409
 */
export async function requestParticipation(boardId) {
  if (USE_MOCK) {
    await delay(400);
    return { chatRoomId: 100 };
  }
  return request(`/api/boards/${boardId}/join`, { method: "POST" });
}
