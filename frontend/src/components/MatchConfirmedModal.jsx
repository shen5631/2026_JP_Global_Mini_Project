const css = `
.matched {
  --primary: #ee6c26;
  --primary-soft: #fdeadd;
  --text: #1f1d1b;

  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  background: rgba(20, 20, 20, 0.5);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
}
.matched *, .matched *::before, .matched *::after { box-sizing: border-box; }

.matched__box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 342px;
  padding: 32px 24px 20px;
  border-radius: 20px;
  background: #ffffff;
  color: var(--text);
  text-align: center;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}
.matched__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
}
.matched__title {
  margin: 16px 0 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
}
.matched__message {
  margin: 8px 0 0;
  color: #555555;
  font-size: 15px;
  line-height: 1.6;
}
.matched__btn {
  width: 100%;
  height: 52px;
  margin-top: 24px;
  border: 0;
  border-radius: 14px;
  background: var(--primary);
  color: #ffffff;
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
}
.matched__btn:active { filter: brightness(0.94); }
.matched__btn:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;

/**
 * P-018 매칭 확정 안내 모달
 * 사용: <MatchConfirmedModal onGoChat={() => navigate(`/chats/${chatRoomId}`)} />
 * 닫기 버튼이 없어요. 채팅방 바로가기로만 나갈 수 있어요.
 */
export default function MatchConfirmedModal({ onGoChat }) {
  return (
    <div className="matched">
      <style>{css}</style>
      <div
        className="matched__box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="matched-title"
      >
        <div className="matched__icon" aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </div>
        <h2 id="matched-title" className="matched__title">
          매칭이 완료되었습니다!
        </h2>
        <p className="matched__message">
          채팅방에서 함께 먹을 시간과 장소를 정해보세요.
        </p>
        <button type="button" className="matched__btn" onClick={onGoChat}>
          채팅방 바로가기
        </button>
      </div>
    </div>
  );
}
