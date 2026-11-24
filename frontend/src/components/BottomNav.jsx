import { useNavigate } from "react-router";
import { useI18n } from "../i18n";

const css = `
.nav {
  --primary: #ee6c26;
  --gray-100: #ededed;
  --gray-500: #949494;
  --nav-h: 64px;

  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
  max-width: 430px;
  height: calc(var(--nav-h) + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  border-top: 1px solid var(--gray-100);
  background: #ffffff;
  transform: translateX(-50%);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
}
.nav__tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 0;
  background: none;
  color: var(--gray-500);
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
}
.nav__tab--on { color: var(--primary); font-weight: 700; }
.nav__tab:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}
`;

const icon = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const TABS = [
  {
    key: "home",
    label: "홈",
    path: "/home",
    icon: (
      <svg {...icon}>
        <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    key: "matching",
    label: "매칭",
    path: "/matching",
    icon: (
      <svg {...icon}>
        <path d="M9 3v5M15 3v5" />
        <path d="M6 5v4a6 6 0 0 0 12 0V5" />
        <path d="M12 15v6" />
      </svg>
    ),
  },
  {
    key: "chat",
    label: "채팅",
    path: "/chats",
    icon: (
      <svg {...icon}>
        <path d="M21 12a8 8 0 0 1-11.7 7L4 20l1.1-4.6A8 8 0 1 1 21 12z" />
      </svg>
    ),
  },
  {
    key: "mypage",
    label: "마이페이지",
    path: "/mypage",
    icon: (
      <svg {...icon}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
      </svg>
    ),
  },
];

/**
 * 하단 네비게이션 (홈 / 매칭 / 채팅 / 마이페이지)
 * 사용: <BottomNav active="home" />
 * active: 'home' | 'matching' | 'chat' | 'mypage'
 */
export default function BottomNav({ active }) {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <nav className="nav" aria-label={t("하단 메뉴")}>
      <style>{css}</style>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`nav__tab${active === tab.key ? " nav__tab--on" : ""}`}
          aria-current={active === tab.key ? "page" : undefined}
          onClick={() => navigate(tab.path)}
        >
          {tab.icon}
          {t(tab.label)}
        </button>
      ))}
    </nav>
  );
}
