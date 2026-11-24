import { useNavigate } from "react-router";

export default function MatchingWait() {
  const navigate = useNavigate();
  function onCancel() {
    navigate("/matching");
  }
  return (
    <main className="wait">
      <style>{css}</style>

      <section className="wait__center">
        {/* 포크 로고: 가운데 두 줄이 눈처럼 깜빡여요 */}
        <svg
          className="wait__logo"
          viewBox="0 0 140 240"
          role="img"
          aria-label="itadakko 로고"
        >
          <g fill="currentColor">
            <rect
              className="wait__eye"
              x="42"
              y="1"
              width="18"
              height="98"
              rx="9"
            />
            <rect
              className="wait__eye"
              x="82"
              y="1"
              width="18"
              height="98"
              rx="9"
            />
            <rect x="50" y="160" width="40" height="78" rx="12" />
          </g>
          <path
            d="M10 73 V105 C10 145 36 170 70 170 C104 170 130 145 130 105 V73"
            fill="none"
            stroke="currentColor"
            strokeWidth="18"
            strokeLinecap="round"
          />
        </svg>

        <p className="wait__text" role="status">
          맛있는 여행을 같이할
          <br />
          친구를 찾고있어요!
        </p>
      </section>

      <button type="button" className="wait__cancel" onClick={onCancel}>
        매칭 취소
      </button>
    </main>
  );
}

const css = `
.wait {
  --primary: #ee6c26;
  --gray-100: #ededed;
  --gray-600: #777777;
  --text: #1f1d1b;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 0 40px calc(env(safe-area-inset-bottom, 0px) + 48px);
  background: #ffffff;
  color: var(--text);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
}
.wait *, .wait *::before, .wait *::after { box-sizing: border-box; }

/* 가운데 영역 */
.wait__center {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

/* 로고 */
.wait__logo {
  width: 112px;
  height: auto;
  color: var(--primary);
  overflow: visible;
}

/* 눈 깜빡임: 3초마다 두 번 깜빡 */
.wait__eye {
  transform-box: fill-box;
  transform-origin: center;
  animation: wait-blink 3s ease-in-out infinite;
}
@keyframes wait-blink {
  0%, 78%, 86%, 94%, 100% { transform: scaleY(1); }
  82%, 90% { transform: scaleY(0.08); }
}

/* 문구 */
.wait__text {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
  text-align: center;
}

/* 취소 버튼 */
.wait__cancel {
  width: 100%;
  height: 54px;
  border: 1px solid var(--gray-100);
  border-radius: 16px;
  background: #ffffff;
  color: var(--gray-600);
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.wait__cancel:active { background: #f7f7f7; }
.wait__cancel:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* 움직임을 줄이는 설정이면 애니메이션 끄기 */
@media (prefers-reduced-motion: reduce) {
  .wait__eye { animation: none; }
}
`;
