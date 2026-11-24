import { useState } from "react";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import CATEGORIES from "../api/CATEGORIES";

/**
 * P-008 빠른 매칭 카테고리 선택 화면 (하단 네비 '매칭' 탭)
 * 라우트 예: <Route path="/matching" element={<QuickMatchPage />} />
 */
export default function QuickMatchPage() {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState(null);

  function handleStart() {
    if (categoryId === null) return;
    // TODO: 빠른 매칭 요청 API 호출 { categoryId }
    navigate("/matchWaiting"); // P-009 빠른 매칭 대기 화면 (경로는 맞춰서 바꿔주세요)
  }

  return (
    <div className="quick">
      <style>{css}</style>

      <main className="quick__main">
        <h1 className="quick__title">
          오늘은 어떤 음식을
          <br />
          같이 먹을까요?
        </h1>
        <p className="quick__desc">
          음식 카테고리를 고르면 같은 메뉴를 원하는 사람과 바로 매칭해드려요.
        </p>

        <div
          className="quick__grid"
          role="radiogroup"
          aria-label="음식 카테고리"
        >
          {CATEGORIES.map((c) => {
            const on = categoryId === c.categoryId;
            return (
              <button
                key={c.categoryId}
                type="button"
                role="radio"
                aria-checked={on}
                className={`quick__card ${on ? "quick__card--on" : ""}`}
                onClick={() => setCategoryId(c.categoryId)}
              >
                {c.categoryName}
                {on && (
                  <svg
                    className="quick__check"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </main>

      <button
        type="button"
        className="quick__start"
        disabled={categoryId === null}
        onClick={handleStart}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
        </svg>
        빠른 매칭 시작
      </button>

      <BottomNav active="matching" />
    </div>
  );
}

const css = `
.quick {
  --primary: #ee6c26;
  --primary-soft: #fdeadd;
  --gray-100: #ededed;
  --gray-300: #d4d4d4;
  --gray-500: #949494;
  --text: #1f1d1b;
  --nav-h: 64px;

  position: relative;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #ffffff;
  color: var(--text);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
  -webkit-tap-highlight-color: transparent;
}
.quick *, .quick *::before, .quick *::after { box-sizing: border-box; }

/* 본문 (고정 버튼/네비에 가리지 않도록 아래 여백) */
.quick__main {
  padding: calc(env(safe-area-inset-top, 0px) + 48px) 20px
    calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 112px);
}
.quick__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
}
.quick__desc {
  margin: 12px 0 0;
  color: var(--gray-500);
  font-size: 14px;
  line-height: 1.5;
  word-break: keep-all;
}

/* 카테고리 */
.quick__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 32px;
}
.quick__card {
  position: relative;
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 18px;
  border: 1px solid var(--gray-300);
  border-radius: 16px;
  background: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}
.quick__card:active { background: #faf8f5; }
.quick__card--on {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 700;
}
.quick__check {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

/* 빠른 매칭 시작 (하단 네비 위 고정) */
.quick__start {
  position: fixed;
  left: 50%;
  bottom: calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 16px);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 40px);
  max-width: 390px;
  height: 52px;
  border: 0;
  border-radius: 16px;
  background: var(--primary);
  color: #ffffff;
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transform: translateX(-50%);
}
.quick__start:active:not(:disabled) { filter: brightness(0.94); }
.quick__start:disabled {
  background: #dadada;
  cursor: default;
}

.quick__card:focus-visible,
.quick__start:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;
