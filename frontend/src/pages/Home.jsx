import { useEffect, useRef, useState } from "react";
import logo from "../assets/Logo.svg";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import { fetchBoards } from "../api/board";
import { useI18n } from "../i18n";
import { useTranslatedTexts } from "../hooks/useTranslatedTexts";
import TranslationNotice from "../components/TranslationNotice";

export default function Home({
  posts: providedPosts,
  loading: providedLoading = false,
  onPostClick,
  onLoadMore, // 목록 맨 아래에 닿으면 호출돼요 (무한 스크롤)
}) {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const sentinelRef = useRef(null);
  const [apiPosts, setApiPosts] = useState([]);
  const [apiLoading, setApiLoading] = useState(providedPosts === undefined);
  const [loadError, setLoadError] = useState("");
  const posts = providedPosts ?? apiPosts;
  const loading = providedPosts === undefined ? apiLoading : providedLoading;
  const translatedTitles = useTranslatedTexts(
    posts.map((post) => post.title ?? ""),
    lang,
  );

  useEffect(() => {
    if (providedPosts !== undefined) return;
    let active = true;
    fetchBoards()
      .then((result) => {
        if (!active) return;
        const boards = Array.isArray(result?.boards) ? result.boards : [];
        setApiPosts(boards.map((board) => {
          const date = new Date(board.boardTime);
          const createdAt = Number.isNaN(date.getTime())
            ? ""
            : date.toLocaleDateString(lang === "ja" ? "ja-JP" : "ko-KR");
          return {
            id: board.boardId,
            title: board.title || board.boardText?.split("\n")[0] || t("제목 없는 모집글"),
            author: board.userNickname,
            createdAt,
          };
        }));
        setLoadError("");
      })
      .catch((e) => {
        if (active) setLoadError(t(e.message || "게시글을 불러오지 못했어요."));
      })
      .finally(() => {
        if (active) setApiLoading(false);
      });
    return () => {
      active = false;
    };
  }, [lang, providedPosts, t]);

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
        <button
          type="button"
          className="home__write"
          onClick={() => navigate("/writeBoard")}
        >
          {t("게시글 작성하기")}
        </button>
      </header>

      <main className="home__main">
        <h1 className="home__title">{t("전체 게시글")}</h1>
        <TranslationNotice
          failed={translatedTitles.failed}
          hasContent={posts.length > 0}
        />

        {loadError && <p className="home__loading" role="alert">{loadError}</p>}

        {posts.length === 0 ? (
          <p className="home__empty">
            {loading ? t("게시글을 불러오는 중...") : t("아직 게시글이 없어요.")}
          </p>
        ) : (
          <ul className="home__list">
            {posts.map((post, index) => (
              <li key={post.id}>
                <button
                  type="button"
                  className="home__post"
                  onClick={() =>
                    onPostClick ? onPostClick(post) : navigate(`/boards/${post.id}`)
                  }
                >
                  <span className="home__post-body">
                    <span className="home__post-title">
                      {translatedTitles.texts[index]}
                    </span>
                    <span className="home__post-meta">
                      {post.author} · {post.createdAt}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {loading && <p className="home__loading">{t("불러오는 중...")}</p>}
        <div ref={sentinelRef} className="home__sentinel" aria-hidden="true" />
      </main>

      <BottomNav active="home" />
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
  justify-content: space-between;
  height: calc(env(safe-area-inset-top, 0px) + 72px);
  padding: env(safe-area-inset-top, 0px) 20px 0;
  background: #ffffff;
}
.home__logo { display: block; height: 28px; width: auto; }

/* 게시글 작성하기 (오른쪽 상단) */
.home__write {
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--primary);
  border-radius: 999px;
  background: #ffffff;
  color: var(--primary);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.home__write:active { background: #fdeadd; }

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

.home__post:focus-visible,
.home__match:focus-visible,
.home__write:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: -2px;
}
.home__match:focus-visible { outline-offset: 3px; }
`;
