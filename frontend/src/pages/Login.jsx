import logo from "../assets/Logo.svg"; // Logo.svg 위치에 맞게 경로 수정해주세요
import { Link } from "react-router";

export default function Login() {
  return (
    <main className="login">
      <style>{css}</style>

      <h1 className="login__logo">
        <img src={logo} alt="itadakko" />
      </h1>

      <form className="login__form" onSubmit={(e) => e.preventDefault()}>
        <div className="login__field">
          <label htmlFor="login-id">아이디</label>
          <input
            id="login-id"
            type="text"
            placeholder="아이디를 입력해주세요"
            autoComplete="username"
          />
        </div>

        <div className="login__field">
          <label htmlFor="login-pw">비밀번호</label>
          <input
            id="login-pw"
            type="password"
            placeholder="비밀번호 (영문, 숫자 8~20자)"
            autoComplete="current-password"
          />
        </div>

        <div className="login__actions">
          <button type="button" className="login__next">
            로그인
          </button>
          <Link to="/signup">
            <button type="button" className="login__signup">
              회원가입
            </button>
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
.login__next:active { filter: brightness(0.94); }
.login__signup {
  padding: 4px 8px;
  border: 0;
  background: none;
  color: var(--primary);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
.login__next:focus-visible,
.login__signup:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
`;
