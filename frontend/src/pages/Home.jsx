import { useEffect, useRef } from "react";
import logo from "../assets/Logo.svg";

// 임시 데이터예요. 나중에 게시글 목록 API 응답으로 교체해주세요
const SAMPLE_POSTS = [
  {
    id: 2,
    title: "오사카 도톤보리 먹방 메이트 구합니다 (12/3~12/6)",
    author: "배고픈 여우",
    createdAt: "2026.11.22.",
    commentCount: 5,
  },
  {
    id: 5,
    title: "교토 말차 디저트 카페 같이 돌아다녀요",
    author: "달콤한 수달",
    createdAt: "2026.11.20.",
    commentCount: 8,
  },
  {
    id: 7,
    title: "후쿠오카 모츠나베 같이 드실 분 구해요",
    author: "야식왕 토끼",
    createdAt: "2026.11.19.",
    commentCount: 2,
  },
  {
    id: 9,
    title: "도쿄 츠키지 시장 아침 먹방 동행 구해요",
    author: "아침형 고양이",
    createdAt: "2026.11.18.",
    commentCount: 4,
  },
];

const TABS = [
  {
    id: "home",
    label: "홈",
    path: "M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  },
  {
    id: "chat",
    label: "채팅",
    path: "M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
  },
  {
    id: "mypage",
    label: "마이페이지",
    path: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  },
];

export default function Home({
  posts = SAMPLE_POSTS,
  loading = false,
  activeTab = "home",
  onPostClick,
  onQuickMatch,
  onNavigate,
  onLoadMore, // 목록 맨 아래에 닿으면 호출돼요 (무한 스크롤)
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!onLoadMore || !el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, loading]);

  return (
    <div className="home">
      <style>{css}</style>

      <header className="home__header">
        <img className="home__logo" src={logo} alt="itadakko" />
      </header>

      <main className="home__main">
        <h1 className="home__title">전체 게시글</h1>

        {posts.length === 0 ? (
          <p className="home__empty">아직 게시글이 없어요.</p>
        ) : (
          <ul className="home__list">
            {posts.map((post) => (
              <li key={post.id}>
                <button
                  type="button"
                  className="home__post"
                  onClick={() => onPostClick?.(post)}
                >
                  <span className="home__post-body">
                    <span className="home__post-title">{post.title}</span>
                    <span className="home__post-meta">
                      {post.author} · {post.createdAt}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {loading && <p className="home__loading">불러오는 중...</p>}
        <div ref={sentinelRef} className="home__sentinel" aria-hidden="true" />
      </main>

      {/* 하단 중앙 고정: 빠른 매칭 */}
      <button type="button" className="home__match" onClick={onQuickMatch}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
        </svg>
        빠른 매칭
      </button>

      {/* 하단 네비게이션 */}
      <nav className="home__nav" aria-label="메뉴">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`home__tab ${activeTab === tab.id ? "home__tab--on" : ""}`}
            aria-current={activeTab === tab.id ? "page" : undefined}
            onClick={() => onNavigate?.(tab.id)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={tab.path} />
            </svg>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

const css = `
.home {
  --primary: #ee6c26;
  --gray-100: #ededed;
  --gray-500: #949494;
  --gray-600: #777777;
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
.home *, .home *::before, .home *::after { box-sizing: border-box; }

/* 상단 */
.home__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  height: calc(env(safe-area-inset-top, 0px) + 72px);
  padding: env(safe-area-inset-top, 0px) 20px 0;
  background: #ffffff;
}
.home__logo { display: block; height: 28px; width: auto; }

/* 본문 (고정 버튼/네비에 가리지 않도록 아래 여백) */
.home__main {
  padding-bottom: calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 112px);
}
.home__title {
  margin: 0;
  padding: 28px 20px 12px;
  font-size: 18px;
  font-weight: 700;
}

/* 게시글 목록 */
.home__list { margin: 0; padding: 0; list-style: none; }
.home__list li + li { border-top: 1px solid var(--gray-100); }
.home__post {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px 20px;
  border: 0;
  background: #ffffff;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.home__post:active { background: #faf8f5; }
.home__post-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.home__post-title {
  display: -webkit-box;
  overflow: hidden;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.home__post-meta {
  overflow: hidden;
  color: var(--gray-500);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.home__comment {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 52px;
  height: 56px;
  border-radius: 14px;
  background: var(--gray-100);
}
.home__comment strong { font-size: 16px; font-weight: 700; }
.home__comment span { color: var(--gray-600); font-size: 12px; }

.home__empty,
.home__loading {
  margin: 0;
  padding: 32px 20px;
  color: var(--gray-500);
  font-size: 14px;
  text-align: center;
}
.home__sentinel { height: 1px; }

/* 빠른 매칭 (하단 중앙 고정) */
.home__match {
  position: fixed;
  left: 50%;
  bottom: calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 16px);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 52px;
  padding: 0 24px;
  border: 0;
  border-radius: 999px;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(238, 108, 38, 0.25);
  color: #ffffff;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transform: translateX(-50%);
}
.home__match:active { filter: brightness(0.94); }

/* 하단 네비게이션 */
.home__nav {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  max-width: 430px;
  height: calc(var(--nav-h) + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  border-top: 1px solid var(--gray-100);
  background: #ffffff;
  transform: translateX(-50%);
}
.home__tab {
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
.home__tab--on { color: var(--primary); font-weight: 700; }

.home__post:focus-visible,
.home__match:focus-visible,
.home__tab:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}
.home__match:focus-visible { outline-offset: 3px; }
`;
