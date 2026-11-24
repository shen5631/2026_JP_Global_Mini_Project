import { useState } from "react";
import { useNavigate } from "react-router";

const css = `
.write {
  --primary: #ee6c26;
  --primary-soft: #fdeadd;
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
.write *, .write *::before, .write *::after { box-sizing: border-box; }

/* 상단 */
.write__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  height: calc(env(safe-area-inset-top, 0px) + 56px);
  padding: env(safe-area-inset-top, 0px) 8px 0;
  background: #ffffff;
}
.write__back {
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
.write__heading {
  margin: 0;
  padding: 8px 20px 4px;
  font-size: 22px;
  font-weight: 700;
}

/* 폼 */
.write__form {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 20px 20px calc(var(--footer-h) + env(safe-area-inset-bottom, 0px) + 16px);
}
.write__field { display: flex; flex-direction: column; gap: 10px; }
.write__label {
  color: var(--primary);
  font-size: 14px;
  font-weight: 700;
}

/* 카테고리 */
.write__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.write__chip {
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
.write__chip--on {
  border-color: var(--primary);
  background: var(--primary);
  color: #ffffff;
  font-weight: 700;
}

/* 입력 */
.write__input,
.write__textarea {
  width: 100%;
  border: 1px solid var(--gray-300);
  border-radius: 16px;
  background: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-size: 16px;
  outline: none;
}
.write__input { height: 52px; padding: 0 18px; }
.write__textarea {
  min-height: 220px;
  padding: 16px 18px;
  line-height: 1.6;
  resize: none;
}
.write__input::placeholder,
.write__textarea::placeholder { color: var(--gray-500); }
.write__input:focus,
.write__textarea:focus { border-color: var(--primary); }

/* 하단 고정 버튼 */
.write__footer {
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
.write__submit {
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
.write__submit:active:not(:disabled) { filter: brightness(0.94); }
.write__submit:disabled {
  background: #dadada;
  cursor: default;
}

.write__back:focus-visible,
.write__chip:focus-visible,
.write__submit:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;

// TODO: category 테이블에서 불러오기 (category_id, 이름)
const CATEGORIES = [
  { categoryId: 1, name: "한식" },
  { categoryId: 2, name: "일식" },
  { categoryId: 3, name: "중식" },
  { categoryId: 4, name: "양식" },
  { categoryId: 5, name: "카페·디저트" },
  { categoryId: 6, name: "술집" },
  { categoryId: 7, name: "기타" },
];

/**
 * P-007 모집 게시글 작성 화면
 * 라우트 예: <Route path="/boards/new" element={<BoardWritePage />} />
 */
export default function BoardWritePage() {
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState(null);
  const [title, setTitle] = useState("");
  const [boardText, setBoardText] = useState("");

  const canSubmit = categoryId !== null && title.trim() && boardText.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: POST /api/boards  { categoryId, title, boardText }
    // board_id 는 AI, user_id 는 로그인 정보, board_time 은 서버에서 생성
    navigate("/");
  };

  return (
    <div className="write">
      <style>{css}</style>

      <header className="write__header">
        <button
          type="button"
          className="write__back"
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

      <h1 className="write__heading">모집글 작성</h1>

      <form className="write__form" id="write-form" onSubmit={handleSubmit}>
        <div
          className="write__field"
          role="group"
          aria-labelledby="label-category"
        >
          <span className="write__label" id="label-category">
            카테고리
          </span>
          <div className="write__chips">
            {CATEGORIES.map((c) => (
              <button
                key={c.categoryId}
                type="button"
                className={`write__chip${categoryId === c.categoryId ? " write__chip--on" : ""}`}
                aria-pressed={categoryId === c.categoryId}
                onClick={() => setCategoryId(c.categoryId)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="write__field">
          <label className="write__label" htmlFor="board-title">
            제목
          </label>
          <input
            id="board-title"
            className="write__input"
            type="text"
            maxLength={50}
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="write__field">
          <label className="write__label" htmlFor="board-text">
            상세 설명
          </label>
          <textarea
            id="board-text"
            className="write__textarea"
            placeholder="여행 일정, 가고 싶은 식당 등을 자유롭게 적어주세요"
            value={boardText}
            onChange={(e) => setBoardText(e.target.value)}
          />
        </div>
      </form>

      <div className="write__footer">
        <button
          type="submit"
          form="write-form"
          className="write__submit"
          disabled={!canSubmit}
        >
          등록하기
        </button>
      </div>
    </div>
  );
}
