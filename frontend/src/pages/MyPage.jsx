import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { deleteBoard, fetchMyBoards } from "../api/board";
import { clearAuth, fetchMe, logout, updateMe } from "../api/authApi";
import { fetchMessages } from "../api/chat";
import {
  cancelMatch,
  decideCanceledBoard,
  fetchMatch,
  fetchMyMatches,
} from "../api/match";
import BottomNav from "../components/BottomNav";
import { useI18n } from "../i18n";
import { useTranslatedTexts } from "../hooks/useTranslatedTexts";
import TranslationNotice from "../components/TranslationNotice";

function formatCreatedAt(value, lang) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(lang === "ja" ? "ja-JP" : "ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function toPostView(board, lang) {
  const lines = (board.boardText ?? "").split("\n");
  return {
    id: board.boardId,
    category: board.categoryName,
    title: board.title || lines[0]?.trim() || "",
    createdAt: formatCreatedAt(board.boardTime, lang),
    content: board.boardText,
    status: board.status,
    pendingMatchLogId: board.pendingMatchLogId,
  };
}

export default function MyPage() {
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [profile, setProfile] = useState(null);
  const [match, setMatch] = useState(null);
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [cancelingMatch, setCancelingMatch] = useState(false);
  const [processingBoard, setProcessingBoard] = useState(null);
  const translatedPosts = useTranslatedTexts(
    posts.flatMap((post) => [post.title, post.content ?? ""]),
    lang,
  );

  useEffect(() => {
    let active = true;

    async function loadMyPage() {
      setStatus("loading");
      setError("");
      try {
        const [me, boardList, matchPage] = await Promise.all([
          fetchMe(),
          fetchMyBoards(),
          fetchMyMatches(0, 20),
        ]);
        if (!Array.isArray(boardList) || !Array.isArray(matchPage?.matches)) {
          throw new Error(t("마이페이지 정보를 불러오지 못했어요."));
        }

        let currentMatch = null;
        const activeMatch = matchPage.matches.find((item) => item.status === "ACTIVE");
        if (activeMatch) {
          const detail = await fetchMatch(activeMatch.matchLogId);
          if (detail.chatRoomId != null) {
            const chat = await fetchMessages(detail.chatRoomId);
            if (chat.active !== false) currentMatch = detail;
          }
        }

        if (!active) return;
        setProfile(me);
        setPosts(boardList.map((board) => toPostView(board, lang)));
        setMatch(currentMatch);
        setStatus("ready");
      } catch (e) {
        if (!active) return;
        if (e.status === 401) {
          clearAuth();
          navigate("/", { replace: true });
          return;
        }
        setError(t(e.message || "마이페이지 정보를 불러오지 못했어요."));
        setStatus("error");
      }
    }

    loadMyPage();
    return () => {
      active = false;
    };
  }, [lang, navigate, retry, t]);

  async function handleEditProfile() {
    if (!profile || savingProfile) return;
    const nickname = window.prompt(t("새 닉네임을 입력해주세요."), profile.userNickname);
    if (nickname === null || nickname.trim() === profile.userNickname) return;
    if (!nickname.trim()) {
      setError(t("닉네임을 입력해주세요."));
      return;
    }

    setSavingProfile(true);
    setError("");
    try {
      await updateMe({ userNickname: nickname.trim() });
      setProfile((current) => ({ ...current, userNickname: nickname.trim() }));
    } catch (e) {
      if (e.status === 401) {
        clearAuth();
        navigate("/", { replace: true });
        return;
      }
      setError(t(e.message || "프로필을 수정하지 못했어요."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDeletePost(post) {
    if (!window.confirm(t("\"{title}\" 모집글을 삭제할까요?", { title: post.title || t("제목 없는 모집글") }))) return;
    setError("");
    try {
      await deleteBoard(post.id);
      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (e) {
      if (e.status === 401) {
        clearAuth();
        navigate("/", { replace: true });
        return;
      }
      setError(t(e.message || "모집글을 삭제하지 못했어요."));
    }
  }

  async function handleCancelMatch() {
    if (!match || cancelingMatch) return;
    if (!window.confirm(t("매칭을 취소할까요? 상대방에게 취소 알림이 전달돼요."))) return;
    setCancelingMatch(true);
    setError("");
    try {
      await cancelMatch(match.matchLogId);
      setMatch(null);
      setRetry((value) => value + 1);
    } catch (e) {
      if (e.status === 401) {
        clearAuth();
        navigate("/", { replace: true });
        return;
      }
      setError(t(e.message || "매칭을 취소하지 못했어요."));
    } finally {
      setCancelingMatch(false);
    }
  }

  async function handleBoardDecision(post, action) {
    if (processingBoard != null) return;
    if (action === "CLOSE" && !window.confirm(t("\"{title}\" 게시글을 삭제할까요?", { title: post.title || t("제목 없는 모집글") }))) {
      return;
    }
    setProcessingBoard(post.id);
    setError("");
    try {
      await decideCanceledBoard(post.pendingMatchLogId, post.id, action);
      setRetry((value) => value + 1);
    } catch (e) {
      if (e.status === 401) {
        clearAuth();
        navigate("/", { replace: true });
        return;
      }
      setError(t(e.message || "모집글을 처리하지 못했어요."));
    } finally {
      setProcessingBoard(null);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (e) {
      if (e.status === 401) {
        clearAuth();
        navigate("/", { replace: true });
        return;
      }
      setLogoutError(t(e.message || "로그아웃하지 못했어요."));
      setLoggingOut(false);
    }
  }

  return (
    <div className="mypage">
      <style>{css}</style>

      <main className="mypage__main">
        <header className="mypage__profile">
          <div>
            <h1 className="mypage__name">
              {profile?.userNickname ?? profile?.userName ?? t("마이페이지")}
            </h1>
            <p className="mypage__meta">
              {t(profile?.userGender ?? (profile?.userLocal ? "현지인" : "여행객"))}
              {profile?.userAge != null ? ` / ${profile.userAge}${t("세")}` : ""}
            </p>
          </div>
          <button
            type="button"
            className="mypage__edit"
            onClick={handleEditProfile}
            disabled={status !== "ready" || savingProfile}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
            </svg>
            {t("프로필 수정")}
          </button>
        </header>

        <div className="mypage__divider" />

        {status === "loading" && (
          <p className="mypage__state" role="status">
            {t("마이페이지를 불러오는 중...")}
          </p>
        )}
        {status === "error" && (
          <div className="mypage__state" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="mypage__retry"
              onClick={() => setRetry((value) => value + 1)}
            >
              {t("다시 시도")}
            </button>
          </div>
        )}
        {status === "ready" && error && (
          <p className="mypage__error" role="alert">
            {error}
          </p>
        )}

        {status === "ready" && (
          <>
        <section className="mypage__section" aria-labelledby="match-status-title">
          <h2 id="match-status-title" className="mypage__section-title">
            {t("매칭 현황")}
          </h2>
          {match ? (
            <>
              <div className="mypage__match">
                <span className="mypage__avatar" aria-hidden="true">
                  {match.partner?.userNickname?.charAt(0) ?? "?"}
                </span>
                <span className="mypage__match-info">
                  <strong>{match.partner?.userNickname ?? t("매칭된 메이트")}</strong>
                  <span>
                    {t(match.partner?.userLocal ? "현지인" : "여행객")}
                    {match.partner?.userAge != null
                      ? ` / ${match.partner.userAge}${t("세")}`
                      : ""}
                  </span>
                </span>
              </div>
              <div className="mypage__match-actions">
                <button
                  type="button"
                  className="mypage__button mypage__button--outline"
                  onClick={handleCancelMatch}
                  disabled={cancelingMatch}
                >
                  {cancelingMatch ? t("취소 중...") : t("매칭 취소")}
                </button>
                <button
                  type="button"
                  className="mypage__button mypage__button--primary"
                  onClick={() =>
                    navigate(`/chats/${match.chatRoomId}`, {
                      state: { partner: match.partner },
                    })
                  }
                  disabled={!match.chatRoomId}
                >
                  {t("채팅으로 이동")}
                </button>
              </div>
            </>
          ) : (
            <p className="mypage__empty">{t("진행 중인 매칭이 없어요.")}</p>
          )}
        </section>

        <section className="mypage__section" aria-labelledby="my-posts-title">
          <h2 id="my-posts-title" className="mypage__section-title">
            {t("내 모집글")}
          </h2>
          <TranslationNotice
            failed={translatedPosts.failed}
            hasContent={posts.length > 0}
          />
          {posts.length > 0 ? (
            <ul className="mypage__posts">
              {posts.map((post, index) => (
                <li className="mypage__post-item" key={post.id}>
                  <article className="mypage__post">
                    <span className="mypage__post-head">
                      <span className="mypage__category">{t(post.category)}</span>
                      <span className="mypage__post-created">
                        {t("작성일 {date}", { date: post.createdAt })}
                      </span>
                    </span>
                    <strong className="mypage__post-title">
                      {translatedPosts.texts[index * 2] || t("제목 없는 모집글")}
                    </strong>
                    <span className="mypage__post-content">
                      {translatedPosts.texts[index * 2 + 1]}
                    </span>
                    {post.status === "CANCEL_PENDING" && (
                      <span className="mypage__board-pending">
                        {t("매칭이 취소됐어요. 게시글을 다시 공개할지 종료할지 선택해주세요.")}
                      </span>
                    )}
                    {post.status === "MATCHED" && (
                      <span className="mypage__board-pending">{t("매칭 진행 중")}</span>
                    )}
                    {post.status === "QUICK_WAITING" && (
                      <span className="mypage__board-pending">{t("빠른 매칭 대기 중 · 게시글 비공개")}</span>
                    )}
                  </article>
                  {post.status === "CANCEL_PENDING" ? (
                    <div className="mypage__board-decision">
                      <button
                        type="button"
                        disabled={processingBoard === post.id}
                        onClick={() => handleBoardDecision(post, "REOPEN")}
                      >
                        {t("다시 공개")}
                      </button>
                      <button
                        type="button"
                        disabled={processingBoard === post.id}
                        onClick={() => handleBoardDecision(post, "CLOSE")}
                      >
                        {t("삭제")}
                      </button>
                    </div>
                  ) : post.status === "OPEN" ? (
                    <button
                      type="button"
                      className="mypage__post-menu"
                      aria-label={t("{title} 메뉴", { title: post.title || t("제목 없는 모집글") })}
                      onClick={() => handleDeletePost(post)}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <circle cx="10" cy="4" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="10" cy="16" r="1.5" />
                      </svg>
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mypage__empty">{t("작성한 모집글이 없어요.")}</p>
          )}
        </section>

          </>
        )}

        <div className="mypage__account-actions">
          <button type="button" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? t("로그아웃 중...") : t("로그아웃")}
          </button>
          <button
            type="button"
            disabled
            title={t("회원탈퇴 API가 아직 없습니다.")}
          >
            {t("회원탈퇴")}
          </button>
        </div>
        {logoutError && (
          <p className="mypage__error" role="alert">
            {logoutError}
          </p>
        )}
        <p className="mypage__unavailable">
          {t("회원탈퇴 기능은 백엔드 API가 아직 제공되지 않아요.")}
        </p>
      </main>

      <BottomNav active="mypage" />
    </div>
  );
}

const css = `
.mypage {
  --primary: #f26a45;
  --primary-soft: #fff0e9;
  --gray-100: #eeeeee;
  --gray-500: #999999;
  --text: #252525;
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
}
.mypage *, .mypage *::before, .mypage *::after { box-sizing: border-box; }
.mypage__main {
  padding: calc(env(safe-area-inset-top, 0px) + 56px) 32px
    calc(var(--nav-h) + env(safe-area-inset-bottom, 0px) + 12px);
}
.mypage__profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 82px;
  padding: 0 8px;
}
.mypage__name { margin: 0; font-size: 22px; font-weight: 700; }
.mypage__meta { margin: 4px 0 0; color: var(--gray-500); font-size: 13px; }
.mypage__edit {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 0 8px 8px;
  border: 0;
  background: none;
  color: var(--primary);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.mypage__edit:disabled { opacity: 0.55; cursor: default; }
.mypage__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 8px;
  color: var(--gray-500);
  font-size: 13px;
  text-align: center;
}
.mypage__state p { margin: 0; }
.mypage__error {
  margin: 0 0 12px;
  color: #d33a2c;
  font-size: 13px;
  text-align: center;
}
.mypage__retry {
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--gray-100);
  border-radius: 10px;
  background: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
}
.mypage__divider { height: 1px; margin: 20px 0 24px; background: var(--gray-100); }
.mypage__section {
  margin-top: 20px;
  padding: 14px 10px 10px;
  border: 1px solid #f0f0f0;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.mypage__section-title {
  margin: 0 6px 10px;
  color: var(--primary);
  font-size: 14px;
  font-weight: 700;
}
.mypage__match {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 76px;
  padding: 10px 14px;
  border: 1px solid var(--gray-100);
  border-radius: 12px;
}
.mypage__avatar {
  display: grid;
  flex: 0 0 46px;
  place-items: center;
  height: 46px;
  border-radius: 9px;
  background: #ffe1d2;
  color: var(--primary);
  font-size: 20px;
  font-weight: 700;
}
.mypage__match-info { display: flex; flex-direction: column; gap: 3px; }
.mypage__match-info strong { font-size: 14px; }
.mypage__match-info span { color: var(--gray-500); font-size: 12px; }
.mypage__match-actions { display: flex; gap: 8px; margin-top: 8px; }
.mypage__button {
  flex: 1;
  min-width: 0;
  height: 40px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.mypage__button--outline {
  border: 1px solid var(--primary);
  background: #ffffff;
  color: var(--primary);
}
.mypage__button--primary {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #ffffff;
}
.mypage__button:disabled { opacity: 0.55; cursor: default; }
.mypage__posts { margin: 0; padding: 0; list-style: none; }
.mypage__post-item {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--gray-100);
  border-radius: 12px;
}
.mypage__post {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
  padding: 12px 40px 12px 14px;
  border: 0;
  background: #ffffff;
  color: inherit;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.mypage__post-head { display: flex; align-items: center; gap: 8px; }
.mypage__category {
  padding: 4px 9px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
}
.mypage__post-created { color: var(--gray-500); font-size: 10px; }
.mypage__post-title { font-size: 13px; line-height: 1.4; }
.mypage__post-content {
  display: -webkit-box;
  overflow: hidden;
  color: var(--gray-500);
  font-size: 11px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}
.mypage__board-pending {
  color: #d33a2c;
  font-size: 11px;
  line-height: 1.5;
}
.mypage__board-decision {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
}
.mypage__board-decision button {
  min-height: 34px;
  padding: 0 8px;
  border: 1px solid var(--primary);
  border-radius: 8px;
  background: #ffffff;
  color: var(--primary);
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.mypage__board-decision button:disabled { opacity: 0.55; cursor: default; }
.mypage__post-menu {
  position: absolute;
  top: 8px;
  right: 7px;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  background: #ffffff;
  color: #555555;
  cursor: pointer;
}
.mypage__empty {
  margin: 0;
  padding: 18px 8px;
  color: var(--gray-500);
  font-size: 12px;
  text-align: center;
}
.mypage__account-actions {
  display: flex;
  justify-content: center;
  gap: 28px;
  margin-top: 44px;
}
.mypage__account-actions button {
  padding: 8px;
  border: 0;
  background: none;
  color: #b7b7b7;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}
.mypage__account-actions button:disabled { cursor: default; }
.mypage__unavailable {
  margin: 8px 0 0;
  color: var(--gray-500);
  font-size: 10px;
  text-align: center;
}
.mypage button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;
