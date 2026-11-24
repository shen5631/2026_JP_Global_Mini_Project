import { useState } from "react";
import logo from "../assets/Logo.svg"; // Logo.svg 위치에 맞게 경로 수정해주세요
import { Link, useNavigate } from "react-router";
import { login } from "../api/authApi";
import { useI18n } from "../i18n";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = userId.trim() !== "" && userPw !== "" && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await login(userId.trim(), userPw);
      navigate("/home");
    } catch (err) {
      setError(
        err.status === 401
          ? "아이디 또는 비밀번호가 일치하지 않아요."
          : "로그인 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <style>{css}</style>

      <h1 className="login__logo">
        <img src={logo} alt="itadakko" />
      </h1>

      <form className="login__form" onSubmit={handleSubmit}>
        <div className="login__field">
          <label htmlFor="login-id">{t("아이디")}</label>
          <input
            id="login-id"
            type="text"
            placeholder={t("아이디를 입력해주세요")}
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        <div className="login__field">
          <label htmlFor="login-pw">{t("비밀번호")}</label>
          <input
            id="login-pw"
            type="password"
            placeholder={t("비밀번호 (영문, 숫자 8~20자)")}
            autoComplete="current-password"
            value={userPw}
            onChange={(e) => setUserPw(e.target.value)}
          />
          {error && (
            <p className="login__error" role="alert">
              {t(error)}
            </p>
          )}
        </div>

        <div className="login__actions">
          <button type="submit" className="login__next" disabled={!canSubmit}>
            {loading ? t("로그인 중...") : t("로그인")}
          </button>
          <Link to="/signup" className="login__signup">
            {t("회원가입")}
          </Link>
        </div>
      </form>
    </main>
  );
}

const css = `
.login {
  --primary: #EE6C26;
  --text: #1F1D1B;
  --border: #CECECE;
  --placeholder: #AAAAAA;


  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 430px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 0 40px 48px;
  background: #ffffff;
  font-family: "suit", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo",
  "Noto Sans KR", sans-serif;
}
.login *, .login *::before, .login *::after { box-sizing: border-box; }

/* 로고 */
.login__logo {
  display: flex;
  justify-content: center;
  margin: 0;
  padding-top: clamp(120px, 26dvh, 220px);
  padding-bottom: 40px;
}
.login__logo img {
  display: block;
  width: 100%;
  max-width: 264px;
  height: auto;
}

/* 폼 */
.login__form {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
}
.login__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.login__field label {
  color: var(--primary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
}
.login__field input {
  width: 100%;
  height: 54px;
  padding: 0 20px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: #ffffff;
  color: var(--text);
  font-family: inherit;
  font-size: 15px;
  outline: none;
  transition: border-color 0.15s ease;
}
.login__field input::placeholder { color: var(--placeholder); }
.login__field input:focus { border-color: var(--primary); }
.login__error {
  margin: 0;
  color: var(--primary);
  font-size: 12px;
  line-height: 1.3;
}

/* 버튼 */
.login__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: auto;
  padding-top: 48px;
}
.login__next {
  width: 100%;
  height: 54px;
  border: 0;
  border-radius: 16px;
  background: var(--primary);
  color: #ffffff;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.login__next:active:not(:disabled) { filter: brightness(0.94); }
.login__next:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
.login__signup {
  padding: 4px 8px;
  color: var(--primary);
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}
.login__next:focus-visible,
.login__signup:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;
