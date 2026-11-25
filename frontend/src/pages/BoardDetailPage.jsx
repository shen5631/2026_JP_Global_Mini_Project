import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchBoardDetail, requestParticipation } from "../api/board";
import { clearAuth, getAuth } from "../api/authApi";
import { useI18n } from "../i18n";
import ConfirmModal from "../components/ConfirmModal";
import MatchConfirmedModal from "../components/MatchConfirmedModal";
import { useTranslatedTexts } from "../hooks/useTranslatedTexts";
import TranslationNotice from "../components/TranslationNotice";

const css = `
.detail {
  --primary: #ee6c26;
  --primary-soft: #fdeadd;
  --primary-dark: #b34a0e;
  --gray-100: #ededed;
  --gray-500: #949494;
  --gray-600: #777777;
  --text: #1f1d1b;
  --footer-h: 92px;

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
.detail *, .detail *::before, .detail *::after { box-sizing: border-box; }

/* 상단 */
.detail__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(env(safe-area-inset-top, 0px) + 56px);
  padding: env(safe-area-inset-top, 0px) 8px 0 8px;
  background: #ffffff;
}
.detail__edit {
  height: 36px;
  margin-right: 12px;
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
.detail__edit:active { background: var(--primary-soft); }
.detail__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 0;
  background: none;
  color: var(--text);
  cursor: pointer;
}

/* 본문 (고정 버튼에 가리지 않도록 아래 여백) */
.detail__main {
  padding: 8px 20px calc(var(--footer-h) + env(safe-area-inset-bottom, 0px) + 16px);
}
.detail__category {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary-dark);
  font-size: 13px;
  font-weight: 700;
}
.detail__title {
  margin: 12px 0 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  word-break: keep-all;
}

/* 작성자 */
.detail__author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 14px 16px;
  border: 1px solid var(--gray-100);
  border-radius: 16px;
}
.detail__avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 18px;
  font-weight: 700;
}
.detail__author-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.detail__nickname { font-size: 16px; font-weight: 700; }
.detail__meta { color: var(--gray-600); font-size: 13px; }

.detail__time {
  margin: 14px 0 0;
  color: var(--gray-500);
  font-size: 13px;
}
.detail__divider {
  height: 1px;
  margin: 18px 0;
  border: 0;
  background: var(--gray-100);
}
.detail__text {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-line; /* board_text 줄바꿈 유지 */
  word-break: break-word;
}

/* 로딩 / 오류 */
.detail__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 60dvh;
  color: var(--gray-500);
  font-size: 14px;
}
.detail__retry {
  height: 44px;
  padding: 0 20px;
  border: 1px solid var(--gray-100);
  border-radius: 12px;
  background: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* 하단 고정 버튼 (홈 하단 네비와 같은 폭) */
.detail__footer {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 20;
  width: 100%;
  max-width: 430px;
  padding: 12px 20px calc(env(safe-area-inset-bottom, 0px) + 20px);
  border-top: 1px solid var(--gray-100);
  background: #ffffff;
  transform: translateX(-50%);
}
.detail__error {
  margin: 0 0 8px;
  color: #d33a2c;
  font-size: 13px;
}
.detail__cta {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 16px;
  background: var(--primary);
  color: #ffffff;
  font-family: inherit;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
}
.detail__cta:active { filter: brightness(0.94); }
.detail__cta:disabled {
  background: #dcdcdc;
  color: #5c5c5c;
  cursor: default;
  filter: none;
}

.detail__back:focus-visible,
.detail__edit:focus-visible,
.detail__retry:focus-visible,
.detail__cta:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;

const pad = (n) => String(n).padStart(2, "0");

// board_time(DATETIME) → "2026.11.22. 14:30"
function formatBoardTime(value, lang) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  if (lang === "ja") {
    return d.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * P-006 모집 게시글 상세 화면
 * 라우트 예: <Route path="/boards/:boardId" element={<BoardDetailPage />} />
 */
export default function BoardDetailPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const [chatRoomId, setChatRoomId] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [board, setBoard] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isAuthor = Number(getAuth()?.userAi) === Number(board?.userAi);
  const translatedBoard = useTranslatedTexts(
    [board?.title ?? "", board?.boardText ?? ""],
    lang,
  );

  const loadBoard = useCallback(async () => {
    try {
      const data = await fetchBoardDetail(boardId);
      setBoard(data);
      setErrorMessage("");
      setStatus("ready");
    } catch (e) {
      setErrorMessage(t(e.message || "게시글을 불러오지 못했어요."));
      setStatus("error");
    }
  }, [boardId, t]);

  useEffect(() => {
    const timerId = window.setTimeout(loadBoard, 0);
    return () => window.clearTimeout(timerId);
  }, [loadBoard]);

  const handleOpenModal = () => {
    // TODO: 비로그인 상태면 P-016 로그인 유도 모달 노출
    setErrorMessage("");
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const result = await requestParticipation(boardId);
      setChatRoomId(result.chatRoomId);
      setJoined(true);
      setModalOpen(false);
    } catch (e) {
      if (e.status === 401) {
        clearAuth();
        navigate("/", { replace: true });
        return;
      }
      setErrorMessage(
        t(e.message || "참여요청에 실패했어요. 잠시 후 다시 시도해주세요."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="detail">
        <style>{css}</style>
        <p className="detail__state">{t("불러오는 중...")}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="detail">
        <style>{css}</style>
        <div className="detail__state">
          <p>{errorMessage || t("게시글을 불러오지 못했어요.")}</p>
          <button
            type="button"
            className="detail__retry"
            onClick={() => {
              setStatus("loading");
              loadBoard();
            }}
          >
            {t("다시 시도")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail">
      <style>{css}</style>

      <header className="detail__header">
        <button
          type="button"
          className="detail__back"
          aria-label={t("뒤로 가기")}
          onClick={() => navigate(-1)}
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
            <path d="M20 12H4" />
            <path d="M10 6l-6 6 6 6" />
          </svg>
        </button>
        {isAuthor && (
          <button
            type="button"
            className="detail__edit"
            onClick={() => navigate(`/editBoard/${board.boardId}`)}
          >
            {t("수정하기")}
          </button>
        )}
      </header>

      <main className="detail__main">
        <span className="detail__category">{t(board.categoryName)}</span>
        <h1 className="detail__title">{translatedBoard.texts[0]}</h1>
        <TranslationNotice failed={translatedBoard.failed} hasContent />

        <section className="detail__author" aria-label={t("작성자 정보")}>
          <div className="detail__avatar" aria-hidden="true">
            {board.userNickname?.charAt(0)}
          </div>
          <div className="detail__author-text">
            <span className="detail__nickname">{board.userNickname}</span>
            <span className="detail__meta">
              {t(board.userLocal ? "현지인" : "여행객")}
            </span>
          </div>
        </section>

        <p className="detail__time">
          {t("작성일 {date}", { date: formatBoardTime(board.boardTime, lang) })}
        </p>
        <hr className="detail__divider" />
        <p className="detail__text">{translatedBoard.texts[1]}</p>
      </main>

      <footer className="detail__footer">
        {errorMessage && (
          <p className="detail__error" role="alert">
            {errorMessage}
          </p>
        )}
        <button
          type="button"
          className="detail__cta"
          onClick={handleOpenModal}
          disabled={joined || isAuthor || submitting}
        >
          {t(isAuthor ? "내 모집글" : joined ? "참여요청 완료" : "참여요청")}
        </button>
      </footer>

      {modalOpen && (
        <ConfirmModal
          title={t("참여요청을 하시겠습니까?")}
          message={t("참여요청을 하면 바로 매칭이 되어 채팅방이 생성됩니다. 그리고 다른 식사에 참여요청을 할 수 없게 됩니다.")}
          confirmLabel={t("참여요청")}
          loading={submitting}
          onConfirm={handleConfirm}
          onCancel={() => setModalOpen(false)}
        />
      )}
      {chatRoomId && (
        <MatchConfirmedModal
          onGoChat={() => navigate(`/chats/${chatRoomId}`)}
        />
      )}
    </div>
  );
}
