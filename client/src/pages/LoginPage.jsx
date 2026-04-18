import { useEffect, useState } from "react";
import "./LoginPage.css";
import loginVisualImage from "../assets/login-visual.jpg";
import {
  LOGIN_API_URL,
  clearStoredSession,
  fetchCurrentUser,
  persistSession,
  refreshStoredSession,
} from "../utils/auth";
const REMEMBERED_EMAIL_KEY = "rememberedLoginEmail";

function LoginPage({ onBackToStore, onForgotPassword, onSignup, onLoginSuccess }) {
  const getRememberedEmail = () => localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
  const [form, setForm] = useState({
    email: getRememberedEmail(),
    password: "",
  });
  const [rememberEmail, setRememberEmail] = useState(() => Boolean(getRememberedEmail()));
  const [showPassword, setShowPassword] = useState(false);
  const [submitState, setSubmitState] = useState({
    loading: false,
    error: "",
  });

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const nextSession = await refreshStoredSession();
        if (nextSession) {
          onLoginSuccess(nextSession);
        }
      } catch {
        clearStoredSession();
      }
    };

    restoreSession();
  }, [onLoginSuccess]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password) {
      setSubmitState({
        loading: false,
        error: "이메일과 비밀번호를 모두 입력해주세요.",
      });
      return;
    }

    try {
      setSubmitState({ loading: true, error: "" });

      const loginResponse = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const contentType = loginResponse.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await loginResponse.json()
        : { message: "서버 응답을 확인할 수 없습니다." };

      if (!loginResponse.ok) {
        throw new Error(data.message || "로그인에 실패했습니다.");
      }

      if (!data.token) {
        throw new Error("로그인 토큰을 받지 못했습니다.");
      }

      const currentUser = await fetchCurrentUser({
        token: data.token,
        tokenType: data.tokenType || "Bearer",
      });

      const session = {
        token: data.token,
        tokenType: data.tokenType || "Bearer",
        expiresIn: data.expiresIn,
        user: currentUser,
        authIdentity: currentUser,
      };

      if (rememberEmail) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, form.email.trim());
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      persistSession(session);

      setSubmitState({ loading: false, error: "" });
      onLoginSuccess(session);
    } catch (error) {
      clearStoredSession();

      setSubmitState({
        loading: false,
        error: error.message || "로그인에 실패했습니다.",
      });
    }
  };

  return (
    <section className="login-page">
      <div className="login-panel">
        <div className="login-copy">
          <button className="login-back-link" type="button" onClick={onBackToStore}>
            <span aria-hidden="true">←</span>
            스토어로 돌아가기
          </button>

          <div className="brand-block">
            <p className="brand-name">달빛공방</p>
            <p className="brand-subtitle">계정에 로그인하세요</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span>이메일</span>
              <input
                name="email"
                type="text"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label className="login-field">
              <span>비밀번호</span>
              <div className="password-input-wrap">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1.5 12s3.5-6 10.5-6 10.5 6 10.5 6-3.5 6-10.5 6S1.5 12 1.5 12Z" />
                    <circle cx="12" cy="12" r="3.2" />
                  </svg>
                </button>
              </div>
            </label>

            <button className="forgot-link" type="button" onClick={onForgotPassword}>
              비밀번호를 잊으셨나요?
            </button>

            <label className="remember-email-row">
              <input
                type="checkbox"
                checked={rememberEmail}
                onChange={(event) => setRememberEmail(event.target.checked)}
              />
              <span>이메일 정보 저장하기</span>
            </label>

            {submitState.error ? <p className="login-error">{submitState.error}</p> : null}

            <button className="login-submit" type="submit" disabled={submitState.loading}>
              {submitState.loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <p className="signup-link-row">
            아직 계정이 없으신가요?
            <button className="inline-link-button" type="button" onClick={onSignup}>
              회원가입
            </button>
          </p>
          <div className="login-demo-account">
            <p>게스트 및 어드민 테스트 계정정보</p>
            <p className="login-demo-account-credential">guest@gmail.com/!1234qwer</p>
            <p className="login-demo-account-credential">admin@gmail.com/!1234qwer</p>
          </div>
        </div>

        <div className="login-visual" aria-hidden="true">
          <img loading="lazy" src={loginVisualImage} alt="" />
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
