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
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
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
 * 참여요청  POST /api/boards/:boardId/participation
 * 성공 시 즉시 매칭 + 채팅방 생성 → { chatRoomId } 반환을 가정
 * 이미 다른 식사에 참여 중이면 409
 */
export async function requestParticipation(boardId) {
  if (USE_MOCK) {
    await delay(400);
    return { chatRoomId: 100 };
  }
  return request(`/api/boards/${boardId}/participation`, { method: "POST" });
}
