// 채팅 API (Spring Chat_controller)
//
//  GET  /api/chats/{chatRoomId}/messages?page=0&size=50  → 메시지 목록
//  POST /api/chats/{chatRoomId}/message   body: { content } → 201
//
// 메시지와 공유 약속 API (Spring Chat_controller)

import { getAccessToken, getAuth } from "./authApi";

async function request(path, options = {}) {
  const token = getAccessToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
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
    error.status = res.status; // 401 로그인 필요, 403 참여자 아님, 404 없는 채팅방 등
    throw error;
  }
  return data;
}

/** 메시지 목록 → { messages: [{ id, from: "me"|"mate", text, sentAt }], active: true|false|null } */
export async function fetchMessages(chatRoomId, { page = 0, size = 50 } = {}) {
  const data = await request(
    `/chats/${chatRoomId}/messages?page=${page}&size=${size}`,
  );
  const myId = getAuth()?.userAi != null ? Number(getAuth().userAi) : null;

  const list = Array.isArray(data)
    ? data
    : (data?.content ?? data?.messages ?? []);

  const messages = list
    .map((m) => {
      const senderId =
        m.senderAi ??
        m.senderUserId ??
        m.senderId ??
        m.sender?.userAi ??
        m.userAi ??
        null;
      const mine =
        m.mine ?? m.isMine ?? (senderId != null && Number(senderId) === myId);
      return {
        id: m.messageId ?? m.chatMessageId ?? m.id,
        from: mine ? "me" : "mate",
        text: m.content ?? m.chatMessageContent ?? "",
        sentAt: m.sentTime ?? m.chatMessageTime ?? m.time ?? "",
      };
    })
    .sort(
      (a, b) => String(a.sentAt).localeCompare(String(b.sentAt)) || a.id - b.id,
    );

  const flag =
    data && !Array.isArray(data)
      ? (data.chatRoomActive ?? data.active ?? data.isActive ?? null)
      : null;

  return { messages, active: flag };
}

/** 메시지 전송 */
export function sendMessage(chatRoomId, content) {
  return request(`/chats/${chatRoomId}/message`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function fetchAppointment(chatRoomId) {
  return request(`/chats/${chatRoomId}/appointment`);
}

export function saveAppointment(chatRoomId, appointment) {
  return request(`/chats/${chatRoomId}/appointment`, {
    method: "PUT",
    body: JSON.stringify(appointment),
  });
}

export function cancelAppointment(chatRoomId) {
  return request(`/chats/${chatRoomId}/appointment`, { method: "DELETE" });
}
