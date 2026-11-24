import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { fetchBoardDetail, updateBoard } from "../api/board";
import { fetchCategories } from "../api/match";
import { clearAuth } from "../api/authApi";
import { useI18n } from "../i18n";

export default function BoardEditPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [board, setBoard] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [title, setTitle] = useState("");
  const [boardText, setBoardText] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const timerId = window.setTimeout(async () => {
      try {
        const [boardData, categoryData] = await Promise.all([
          fetchBoardDetail(boardId),
          fetchCategories(),
        ]);
        if (!active) return;
        setBoard(boardData);
        setCategoryId(boardData.categoryId);
        setTitle(boardData.title ?? "");
        setBoardText(boardData.boardText ?? "");
        setCategories(categoryData.filter((item) => item.name !== "상관없음"));
        setStatus("ready");
      } catch (e) {
        if (!active) return;
        if (e.status === 401) {
          clearAuth();
          navigate("/", { replace: true });
          return;
        }
        setError(t(e.message || "게시글 정보를 불러오지 못했어요."));
        setStatus("error");
      }
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [boardId, navigate, t]);

  const changed = Boolean(board) && (
    categoryId !== board.categoryId ||
    title !== board.title ||
    boardText !== board.boardText
  );
  const canSubmit =
    changed && categoryId !== null && title.trim() && boardText.trim() && !saving;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError("");
    try {
      await updateBoard(boardId, {
        categoryId,
        title: title.trim(),
        boardText: boardText.trim(),
      });
      navigate(`/boards/${boardId}`, { replace: true });
    } catch (e) {
      if (e.status === 401) {
        clearAuth();
        navigate("/", { replace: true });
        return;
      }
      setError(t(e.message || "게시글을 수정하지 못했어요."));
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="edit">
        <style>{css}</style>
        <p className="edit__state" role="status">{t("게시글 정보를 불러오는 중...")}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="edit">
        <style>{css}</style>
        <div className="edit__state" role="alert">
          <p>{error}</p>
          <button type="button" className="edit__back" onClick={() => navigate(-1)}>
            {t("돌아가기")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit">
      <style>{css}</style>

      <header className="edit__header">
        <button
          type="button"
          className="edit__back"
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
      </header>

      <h1 className="edit__heading">{t("모집글 수정")}</h1>

      <form className="edit__form" id="edit-form" onSubmit={handleSubmit}>
        <div
          className="edit__field"
          role="group"
          aria-labelledby="edit-label-category"
        >
          <span className="edit__label" id="edit-label-category">
            {t("카테고리")}
          </span>
          <div className="edit__chips">
            {categories.map((category) => (
              <button
                key={category.categoryId}
                type="button"
                className={`edit__chip ${categoryId === category.categoryId ? "edit__chip--on" : ""}`}
                aria-pressed={categoryId === category.categoryId}
                onClick={() => setCategoryId(category.categoryId)}
              >
                {t(category.name)}
              </button>
            ))}
          </div>
        </div>

        <div className="edit__field">
          <label className="edit__label" htmlFor="edit-title">
            {t("제목")}
          </label>
          <input
            id="edit-title"
            className="edit__input"
            type="text"
            maxLength={100}
            placeholder={t("제목을 입력해주세요")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="edit__field">
          <label className="edit__label" htmlFor="edit-text">
            {t("상세 설명")}
          </label>
          <textarea
            id="edit-text"
            className="edit__textarea"
            placeholder={t("여행 일정, 가고 싶은 식당 등을 자유롭게 적어주세요")}
            value={boardText}
            onChange={(e) => setBoardText(e.target.value)}
          />
        </div>
        {error && <p className="edit__error" role="alert">{error}</p>}
      </form>

      <div className="edit__footer">
        <button
          type="submit"
          form="edit-form"
          className="edit__submit"
          disabled={!canSubmit}
        >
          {saving ? t("저장 중...") : t("수정하기")}
        </button>
      </div>
    </div>
  );
}

const css = `
.edit {
  --primary: #ee6c26;
  --gray-100: #ededed;
  --gray-300: #d4d4d4;
  --gray-500: #949494;
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
.edit *, .edit *::before, .edit *::after { box-sizing: border-box; }

/* 상단 */
.edit__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  height: calc(env(safe-area-inset-top, 0px) + 56px);
  padding: env(safe-area-inset-top, 0px) 8px 0;
  background: #ffffff;
}
.edit__back {
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
.edit__heading {
  margin: 0;
  padding: 8px 20px 4px;
  font-size: 22px;
  font-weight: 700;
}
.edit__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 20px;
  color: var(--gray-500);
  font-size: 14px;
  text-align: center;
}
.edit__state p { margin: 0; }
.edit__state .edit__back {
  width: auto;
  padding: 0 16px;
  border: 1px solid var(--gray-100);
  border-radius: 10px;
  font-family: inherit;
}
.edit__error { margin: 0; color: #d33a2c; font-size: 13px; }

/* 폼 */
.edit__form {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 20px 20px calc(var(--footer-h) + env(safe-area-inset-bottom, 0px) + 16px);
}
.edit__field { display: flex; flex-direction: column; gap: 10px; }
.edit__label {
  color: var(--primary);
  font-size: 14px;
  font-weight: 700;
}

/* 카테고리 */
.edit__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.edit__chip {
  height: 40px;
  padding: 0 16px;
  border: 1px solid var(--gray-300);
  border-radius: 999px;
  background: #ffffff;
  color: #555555;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.edit__chip--on {
  border-color: var(--primary);
  background: var(--primary);
  color: #ffffff;
  font-weight: 700;
}

/* 입력 */
.edit__input,
.edit__textarea {
  width: 100%;
  border: 1px solid var(--gray-300);
  border-radius: 16px;
  background: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-size: 16px;
  outline: none;
}
.edit__input { height: 52px; padding: 0 18px; }
.edit__textarea {
  min-height: 220px;
  padding: 16px 18px;
  line-height: 1.6;
  resize: none;
}
.edit__input::placeholder,
.edit__textarea::placeholder { color: var(--gray-500); }
.edit__input:focus,
.edit__textarea:focus { border-color: var(--primary); }

/* 하단 고정 버튼 */
.edit__footer {
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
.edit__submit {
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
.edit__submit:active:not(:disabled) { filter: brightness(0.94); }
.edit__submit:disabled {
  background: #dadada;
  cursor: default;
}

.edit__back:focus-visible,
.edit__chip:focus-visible,
.edit__submit:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;
