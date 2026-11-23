import { useState } from "react";
import logo from "../assets/Logo.svg";

const TEXT = {
  ko: {
    title: ["맛있는 여행에", "오신 것을 환영해요!"],
    start: "맛있는 여행 함께하기",
  },
  // 일본어 문구는 임시 번역이에요. 확인 후 수정해주세요
  ja: {
    title: ["おいしい旅へ", "ようこそ！"],
    start: "おいしい旅を一緒に楽しむ",
  },
};

const LANGS = [
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
];

// 포크 로고: 가운데 두 줄이 눈처럼 깜빡여요
function ForkIcon() {
  return (
    <svg className="landing__fork" viewBox="0 0 140 240" aria-hidden="true">
      <g fill="currentColor">
        <rect
          className="landing__eye"
          x="42"
          y="1"
          width="18"
          height="98"
          rx="9"
        />
        <rect
          className="landing__eye"
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
  );
}

export default function Landing({ onStart }) {
  const [lang, setLang] = useState("ko");
  const t = TEXT[lang];

  return (
    <div className="landing">
      <style>{css}</style>

      {/* 상단 바 */}
      <header className="landing__header">
        <div className="landing__inner landing__bar">
          <img className="landing__brand" src={logo} alt="itadakko" />

          <div className="landing__langs" role="group" aria-label="언어 선택">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                className={`landing__lang ${lang === code ? "landing__lang--on" : ""}`}
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="landing__hero">
        <div className="landing__inner landing__grid">
          <div className="landing__copy">
            <h1 className="landing__title">
              {t.title[0]}
              <br />
              {t.title[1]}
            </h1>
            <button type="button" className="landing__start" onClick={onStart}>
              {t.start}
            </button>
          </div>

          {/* 폰 목업 */}
          <div className="landing__phone" aria-hidden="true">
            <div className="landing__notch" />
            <div className="landing__screen">
              <ForkIcon />
              <img className="landing__screen-logo" src={logo} alt="" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const css = `
.landing {
  --primary: #ee6c26;
  --gray-100: #ededed;
  --gray-600: #777777;
  --text: #1f1d1b;

  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #ffffff;
  color: var(--text);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", "Hiragino Sans", sans-serif;
}
.landing *, .landing *::before, .landing *::after { box-sizing: border-box; }

.landing__inner {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 상단 바 */
.landing__header { background: #ffffff; }
.landing__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
}
.landing__brand {
  display: block;
  height: 32px;
  width: auto;
}

/* 언어 선택 */
.landing__langs {
  display: flex;
  padding: 4px;
  border: 1px solid var(--gray-100);
  border-radius: 999px;
}
.landing__lang {
  padding: 8px 16px;
  border: 0;
  border-radius: 999px;
  background: none;
  color: var(--gray-600);
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.landing__lang--on {
  background: var(--primary);
  color: #ffffff;
  font-weight: 700;
}

/* 히어로 */
.landing__hero {
  display: flex;
  flex: 1;
  align-items: center;
  padding: 48px 0;
  background: var(--primary);
}
.landing__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 64px;
}

/* 문구 + 버튼 */
.landing__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 40px;
  padding-left: 40px;
}
.landing__title {
  margin: 0;
  color: #ffffff;
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 700;
  line-height: 1.3;
}
.landing__start {
  height: 60px;
  padding: 0 36px;
  border: 0;
  border-radius: 16px;
  background: #ffffff;
  color: var(--primary);
  font-family: inherit;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.landing__start:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(31, 29, 27, 0.18);
}
.landing__start:active { transform: translateY(0); box-shadow: none; }
.landing__start:focus-visible,
.landing__lang:focus-visible {
  outline: 3px solid var(--text);
  outline-offset: 3px;
}

/* 폰 목업 */
.landing__phone {
  position: relative;
  justify-self: center;
  width: 280px;
  aspect-ratio: 280 / 560;
  padding: 12px;
  border-radius: 44px;
  background: var(--text);
  box-shadow: 0 24px 48px rgba(31, 29, 27, 0.25);
  animation: landing-float 4s ease-in-out infinite;
}
.landing__notch {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 1;
  width: 96px;
  height: 26px;
  border-radius: 0 0 16px 16px;
  background: var(--text);
  transform: translateX(-50%);
}
.landing__screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 36px;
  width: 100%;
  height: 100%;
  border-radius: 32px;
  background: #ffffff;
}
.landing__fork {
  width: 84px;
  height: auto;
  color: var(--primary);
  overflow: visible;
}
.landing__screen-logo {
  display: block;
  width: 70%;
  height: auto;
}

/* 눈 깜빡임 */
.landing__eye {
  transform-box: fill-box;
  transform-origin: center;
  animation: landing-blink 3s ease-in-out infinite;
}
@keyframes landing-blink {
  0%, 78%, 86%, 94%, 100% { transform: scaleY(1); }
  82%, 90% { transform: scaleY(0.08); }
}
@keyframes landing-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 모바일: 세로로 쌓기 */
@media (max-width: 820px) {
  .landing__grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .landing__copy {
    align-items: center;
    padding-left: 0;
    text-align: center;
  }
  .landing__phone { width: 240px; }
}

@media (prefers-reduced-motion: reduce) {
  .landing__eye, .landing__phone { animation: none; }
}
`;
