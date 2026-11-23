import { useState } from "react";
import logo from "../assets/Logo.svg";
import backIcon from "../assets/Back.svg";
import { checkId } from "../api/authApi";
import { useNavigate } from "react-router";
const TOTAL_STEPS = 3;

const ID_MESSAGES = {
  available: "사용 가능한 아이디예요.",
  taken: "이미 사용 중인 아이디예요.",
  invalid: "아이디 형식이 올바르지 않아요.",
  error: "확인 중 문제가 생겼어요. 다시 시도해주세요.",
};

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  // 이전 단계로 돌아가도 입력한 값이 남아있도록 한곳에서 들고 있어요
  const [form, setForm] = useState({
    id: "",
    pw: "",
    pwConfirm: "",
    name: "",
    nickname: "",
    gender: "여성",
    birth: "",
    userType: "traveler",
    country: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 아이디 중복확인 결과. 아이디를 고치면 결과가 자동으로 무효가 돼요
  const [idCheck, setIdCheck] = useState({ id: "", status: "idle" });
  const [isChecking, setIsChecking] = useState(false);
  const userId = form.id.trim();
  const idStatus = idCheck.id === userId ? idCheck.status : "idle";

  const handleCheckId = async () => {
    if (!userId || isChecking) return;
    setIsChecking(true);
    try {
      const status = await checkId(userId); // "available" | "taken" | "invalid"
      setIdCheck({ id: userId, status });
    } catch {
      setIdCheck({ id: userId, status: "error" });
    } finally {
      setIsChecking(false);
    }
  };

  // 단계별로 모두 채워져야 "다음"이 활성화돼요
  const canNext = {
    1: idStatus === "available" && form.pw !== "" && form.pw === form.pwConfirm,
    2:
      form.name.trim() !== "" &&
      form.nickname.trim() !== "" &&
      form.gender !== "" &&
      form.birth.length === 10,
    3: form.userType !== "" && form.country !== "",
  }[step];

  const goNext = () => {
    if (!canNext) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const goPrev = () => {
    return step === 1 ? navigate("/") : setStep((s) => Math.max(s - 1, 1));
  };

  return (
    <main className="signup">
      <style>{css}</style>

      <button
        type="button"
        className="signup__back"
        aria-label="이전"
        onClick={goPrev} // 1단계에서는 나중에 로그인 화면으로 이동하도록 연결
      >
        <img src={backIcon} alt="" />
      </button>

      {step === 1 && (
        <h1 className="signup__logo">
          <img src={logo} alt="itadakko" />
        </h1>
      )}

      <ol
        className={`signup__steps signup__steps--${step}`}
        aria-label="회원가입 단계"
      >
        {[1, 2, 3].map((n) => (
          <li
            key={n}
            className={`signup__step ${n <= step ? "signup__step--on" : ""}`}
            aria-current={n === step ? "step" : undefined}
          >
            {n}
          </li>
        ))}
      </ol>

      <form className="signup__form" onSubmit={(e) => e.preventDefault()}>
        {/* 1단계: 계정 정보 */}
        {step === 1 && (
          <div className="signup__fields">
            <div className="signup__field">
              <label htmlFor="signup-id">아이디</label>
              <div className="signup__row">
                <input
                  id="signup-id"
                  name="id"
                  type="text"
                  placeholder="아이디을 입력해주세요"
                  autoComplete="username"
                  value={form.id}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="signup__dup-btn"
                  onClick={handleCheckId}
                  disabled={!userId || isChecking || idStatus === "available"}
                >
                  {isChecking
                    ? "확인 중"
                    : idStatus === "available"
                      ? "확인완료"
                      : "중복확인"}
                </button>
              </div>
              {idStatus !== "idle" && (
                <p
                  role="status"
                  className={`signup__msg ${
                    idStatus === "available" ? "" : "signup__msg--error"
                  }`}
                >
                  {ID_MESSAGES[idStatus]}
                </p>
              )}
            </div>
            <div className="signup__field">
              <label htmlFor="signup-pw">비밀번호</label>
              <input
                id="signup-pw"
                name="pw"
                type="password"
                placeholder="비밀번호 (영문, 숫자 8~20자)"
                autoComplete="new-password"
                value={form.pw}
                onChange={handleChange}
              />
            </div>
            <div className="signup__field">
              <label htmlFor="signup-pw-confirm">비밀번호 확인</label>
              <input
                id="signup-pw-confirm"
                name="pwConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                autoComplete="new-password"
                value={form.pwConfirm}
                onChange={handleChange}
              />
              {form.pwConfirm !== "" && form.pw !== form.pwConfirm && (
                <p className="signup__msg signup__msg--error">
                  비밀번호가 일치하지 않아요.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 2단계: 기본 정보 */}
        {step === 2 && (
          <div className="signup__fields">
            <div className="signup__field">
              <label htmlFor="signup-name">이름</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                placeholder="이름을 입력해주세요"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="signup__field">
              <label htmlFor="signup-nickname">닉네임</label>
              <input
                id="signup-nickname"
                name="nickname"
                type="text"
                placeholder="닉네임을 입력해주세요"
                value={form.nickname}
                onChange={handleChange}
              />
            </div>
            <div className="signup__field">
              <label htmlFor="signup-gender">성별</label>
              <select
                id="signup-gender"
                name="gender"
                className="signup__select signup__select--short"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="여성">여성</option>
                <option value="남성">남성</option>
              </select>
            </div>
            <div className="signup__field">
              <label htmlFor="signup-birth">생년월일</label>
              <input
                id="signup-birth"
                name="birth"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="YYYY.MM.DD"
                autoComplete="bday"
                value={form.birth}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {/* 3단계: 유형 / 국가 */}
        {step === 3 && (
          <div className="signup__fields">
            <div
              className="signup__types"
              role="radiogroup"
              aria-label="사용자 유형"
            >
              <label className="signup__check">
                <input
                  type="radio"
                  name="userType"
                  value="local"
                  checked={form.userType === "local"}
                  onChange={handleChange}
                />
                현지인
              </label>
              <label className="signup__check">
                <input
                  type="radio"
                  name="userType"
                  value="traveler"
                  checked={form.userType === "traveler"}
                  onChange={handleChange}
                />
                여행객
              </label>
            </div>

            <div className="signup__field">
              <label htmlFor="signup-country">국가</label>
              <select
                id="signup-country"
                name="country"
                className={`signup__select ${form.country === "" ? "is-empty" : ""}`}
                value={form.country}
                onChange={handleChange}
              >
                <option value="" disabled>
                  국가 선택
                </option>
                {/* 임시 목록이에요. 실제 국가 목록으로 교체해주세요 */}
                <option value="KR">대한민국</option>
                <option value="JP">일본</option>
                <option value="CN">중국</option>
                <option value="US">미국</option>
              </select>
            </div>
          </div>
        )}

        <div className="signup__actions">
          {step > 1 && (
            <button
              type="button"
              className="signup__btn signup__btn--ghost"
              onClick={goPrev}
            >
              이전
            </button>
          )}
          <button
            type="button"
            className="signup__btn signup__btn--primary"
            onClick={goNext}
            disabled={!canNext}
          >
            다음
          </button>
        </div>
      </form>
    </main>
  );
}

const css = `
.signup {
  --primary: #ee6c26;
  --primary-soft: #fbdac9;
  --gray-100: #ededed;
  --gray-300: #d9d9d9;
  --gray-400: #aaaaaa;
  --gray-600: #777777;
  --text: #1f1d1b;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: calc(env(safe-area-inset-top, 0px) + 24px) 40px 48px;
  background: #ffffff;
  color: var(--text);
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
    "Noto Sans KR", sans-serif;
}
.signup *, .signup *::before, .signup *::after { box-sizing: border-box; }

/* 뒤로가기 */
.signup__back {
  display: block;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}
.signup__back img { display: block; width: 24px; height: 24px; }

/* 로고 (1단계에만) */
.signup__logo {
  display: flex;
  justify-content: center;
  margin: 48px 0 0;
}
.signup__logo img {
  display: block;
  width: 100%;
  max-width: 264px;
  height: auto;
}

/* 단계 표시 */
.signup__steps {
  position: relative;
  display: flex;
  justify-content: center;
  gap: 56px;
  margin: 40px 0;
  padding: 0;
  list-style: none;
}
.signup__steps::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--primary-soft);
}
/* 현재 단계의 동그라미까지 채워지는 선 (동그라미 중심 간격 = 28px + 56px = 84px) */
.signup__steps::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  height: 1px;
  width: var(--fill, 0);
  background: var(--primary);
  transition: width 0.3s ease;
}
.signup__steps--1 { --fill: calc(50% - 84px); }
.signup__steps--2 { --fill: 50%; }
.signup__steps--3 { --fill: calc(50% + 84px); }
.signup__step {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 14px;
  font-weight: 700;
}
.signup__step--on {
  background: var(--primary);
  color: #ffffff;
}

/* 폼 */
.signup__form {
  display: flex;
  flex: 1;
  flex-direction: column;
}
.signup__fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.signup__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.signup__field label {
  color: var(--primary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}
.signup__field input[type="text"],
.signup__field input[type="password"],
.signup__select {
  width: 100%;
  height: 54px;
  padding: 0 20px;
  border: 1px solid var(--gray-100);
  border-radius: 16px;
  background-color: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s ease;
}
.signup__field input::placeholder { color: var(--gray-400); }
.signup__field input:focus,
.signup__select:focus { border-color: var(--primary); }

/* 아이디 + 중복확인 */
.signup__row {
  display: flex;
  gap: 8px;
}
.signup__row input { flex: 1; min-width: 0; }
.signup__dup-btn {
  flex-shrink: 0;
  height: 54px;
  padding: 0 16px;
  border: 1px solid var(--primary);
  border-radius: 16px;
  background: #ffffff;
  color: var(--primary);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.signup__dup-btn:disabled {
  border-color: var(--gray-100);
  color: var(--gray-400);
  cursor: default;
}

/* 안내 문구 */
.signup__msg {
  margin: 0;
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.3;
}
.signup__msg--error { color: var(--primary); }

/* 셀렉트 */
.signup__select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 48px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M4 6l4 4 4-4' stroke='%23777777' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 18px center;
  cursor: pointer;
}
.signup__select--short { width: 112px; }
.signup__select.is-empty { color: var(--gray-400); }

/* 현지인 / 여행객 */
.signup__types {
  display: flex;
  gap: 32px;
}
.signup__check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}
.signup__check input {
  appearance: none;
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  margin: 0;
  border: 1.5px solid var(--gray-300);
  border-radius: 6px;
  background: #ffffff center / 12px no-repeat;
  cursor: pointer;
}
.signup__check input:checked {
  border-color: var(--primary);
  background-color: var(--primary);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3 8.5l3.2 3L13 5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

/* 하단 버튼 */
.signup__actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 48px;
}
.signup__btn {
  flex: 1;
  height: 54px;
  border-radius: 16px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.signup__btn--primary {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #ffffff;
}
.signup__btn--primary:not(:disabled):active { filter: brightness(0.94); }
.signup__btn--primary:disabled {
  border-color: var(--gray-300);
  background: var(--gray-300);
  cursor: not-allowed;
}
.signup__btn--ghost {
  border: 1px solid var(--primary);
  background: #ffffff;
  color: var(--primary);
}

.signup__back:focus-visible,
.signup__btn:focus-visible,
.signup__dup-btn:focus-visible,
.signup__check input:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;
