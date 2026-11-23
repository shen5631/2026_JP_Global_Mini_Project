// 아이디 중복확인: GET /api/users/check-id?userId=...
// 반환값: "available" (사용 가능) | "taken" (중복) | "invalid" (형식 오류, 400)
export async function checkId(userId) {
  const res = await fetch(
    `/api/users/check-id?userId=${encodeURIComponent(userId)}`,
  );

  if (res.status === 400) return "invalid";
  if (!res.ok) throw new Error("아이디 중복확인 요청에 실패했어요.");

  const data = await res.json();
  return data.available ? "available" : "taken";
}
