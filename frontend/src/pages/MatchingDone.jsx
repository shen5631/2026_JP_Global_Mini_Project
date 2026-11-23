// 임시 데이터예요. 나중에 매칭 결과 API 응답으로 교체해주세요
const SAMPLE_MATE = {
  nickname: "느긋한 너구리",
  gender: "여성",
  age: 27,
  profileImage: "", // 비어 있으면 닉네임 첫 글자로 대신 보여줘요
};

export default function MatchingDone({
  mate = SAMPLE_MATE,
  onViewProfile,
  onGoChat,
}) {
  return (
    <main className="done">
      <style>{css}</style>

      <header className="done__head">
        <h1 className="done__title">
          맛있는 여행 동료가
          <br />
          매칭 되었어요!
        </h1>
        <p className="done__sub">잘먹겠습니다!</p>
      </header>

      <section className="done__card" aria-label="메이트 프로필">
        <h2 className="done__card-title">메이트 프로필</h2>

        <button type="button" className="done__profile" onClick={onViewProfile}>
          <span className="done__avatar">
            {mate.profileImage ? (
              <img src={mate.profileImage} alt="" />
            ) : (
              mate.nickname.charAt(0)
            )}
          </span>

          <span className="done__info">
            <span className="done__name">{mate.nickname}</span>
            <span className="done__meta">
              {mate.gender} / {mate.age}세
            </span>
          </span>

          <svg
            className="done__chevron"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7.5 4.5L13 10l-5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </section>

      <div className="done__actions">
        <button type="button" className="done__chat" onClick={onGoChat}>
          채팅방 바로가기
        </button>
      </div>
    </main>
  );
}

const css = `
.done {
  --primary: #ee6c26;
  --primary-soft: #fbdac9;
  --gray-100: #ededed;
  --gray-400: #aaaaaa;
  --gray-600: #777777;
  --text: #1f1d1b;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: calc(env(safe-area-inset-top, 0px) + 80px) 40px
    calc(env(safe-area-inset-bottom, 0px) + 48px);
  background: #ffffff;
  color: var(--text);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
}
.done *, .done *::before, .done *::after { box-sizing: border-box; }

/* 문구 */
.done__head { animation: done-rise 0.5s ease both; }
.done__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
}
.done__sub {
  margin: 12px 0 0;
  color: var(--primary);
  font-size: 18px;
  font-weight: 700;
}

/* 프로필 카드 */
.done__card {
  margin-top: 40px;
  padding: 20px;
  border: 1px solid var(--gray-100);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(31, 29, 27, 0.06);
  animation: done-rise 0.5s ease 0.15s both;
}
.done__card-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 700;
}
.done__profile {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-100);
  border-radius: 16px;
  background: #ffffff;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.done__avatar {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 56px;
  height: 56px;
  overflow: hidden;
  border-radius: 14px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 22px;
  font-weight: 700;
}
.done__avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.done__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.done__name {
  overflow: hidden;
  font-size: 16px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.done__meta {
  color: var(--gray-600);
  font-size: 13px;
}
.done__chevron {
  flex-shrink: 0;
  color: var(--gray-400);
}

/* 채팅방 버튼 */
.done__actions {
  margin-top: auto;
  padding-top: 48px;
}
.done__chat {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 16px;
  background: var(--primary);
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.done__chat:active { filter: brightness(0.94); }
.done__chat:focus-visible,
.done__profile:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

@keyframes done-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .done__head, .done__card { animation: none; }
}
`;
