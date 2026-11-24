import { useState } from "react";
import { useNavigate } from "react-router";
import CATEGORIES from "../api/CATEGORIES";

// 임시 데이터예요. 나중에 게시글 상세 조회 API 응답으로 교체해주세요
const SAMPLE_BOARD = {
  boardId: 2,
  categoryId: 2,
  title: "오사카 도톤보리 먹방 메이트 구합니다 (12/3~12/6)",
  boardText:
    "12/3부터 12/6까지 오사카에 머무는 동안 같이 먹방 다니실 분을 찾고 있어요.\n도톤보리에서 타코야키, 오코노미야키, 쿠시카츠 위주로 돌아다닐 예정이에요.\n일정과 식당은 매칭 후 채팅방에서 편하게 정해요!",
};

/**
 * P-019 모집 게시글 수정 화면
 * 라우트 예: <Route path="/editBoard" element={<BoardEditPage />} />
 */
export default function BoardEditPage({ board = SAMPLE_BOARD }) {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState(board.categoryId);
  const [title, setTitle] = useState(board.title);
  const [boardText, setBoardText] = useState(board.boardText);

  const changed =
    categoryId !== board.categoryId ||
    title !== board.title ||
    boardText !== board.boardText;
  const canSubmit =
    changed && categoryId !== null && title.trim() && boardText.trim();

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: PUT /api/boards/:boardId  { categoryId, title, boardText }
    navigate(-1);
  }

  return (
    <div className="edit">
      <style>{css}</style>

      <header className="edit__header">
        <button
          type="button"
          className="edit__back"
          aria-label="뒤로 가기"
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

      <h1 className="edit__heading">모집글 수정</h1>

      <form className="edit__form" id="edit-form" onSubmit={handleSubmit}>
        <div
          className="edit__field"
          role="group"
          aria-labelledby="edit-label-category"
        >
          <span className="edit__label" id="edit-label-category">
            카테고리
          </span>
          <div className="edit__chips">
            {CATEGORIES.map((c) => (
              <button
                key={c.categoryId}
                type="button"
                className={`edit__chip ${categoryId === c.categoryId ? "edit__chip--on" : ""}`}
                aria-pressed={categoryId === c.categoryId}
                onClick={() => setCategoryId(c.categoryId)}
              >
                {c.categoryName}
              </button>
            ))}
          </div>
        </div>

        <div className="edit__field">
          <label className="edit__label" htmlFor="edit-title">
            제목
          </label>
          <input
            id="edit-title"
            className="edit__input"
            type="text"
            maxLength={50}
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="edit__field">
          <label className="edit__label" htmlFor="edit-text">
            상세 설명
          </label>
          <textarea
            id="edit-text"
            className="edit__textarea"
            placeholder="여행 일정, 가고 싶은 식당 등을 자유롭게 적어주세요"
            value={boardText}
            onChange={(e) => setBoardText(e.target.value)}
          />
        </div>
      </form>

      <div className="edit__footer">
        <button
          type="submit"
          form="edit-form"
          className="edit__submit"
          disabled={!canSubmit}
        >
          수정하기
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
