import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import AccountSidebar from "../components/account/AccountSidebar";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { AUTH_PASSWORD_API_URL, getAuthorizationHeader } from "../utils/auth";
import "./AccountPage.css";

// 클라이언트 비밀번호 유효성 패턴 — 서버 모델과 동일한 규칙
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

// 새 비밀번호 입력 값에 대해 클라이언트 유효성을 검사한다
const validateForm = ({ currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return "현재 비밀번호, 새 비밀번호, 새 비밀번호 확인을 모두 입력해주세요.";
  }

  if (newPassword !== confirmPassword) {
    return "새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.";
  }

  if (currentPassword === newPassword) {
    return "새 비밀번호는 현재 비밀번호와 같을 수 없습니다.";
  }

  if (!PASSWORD_PATTERN.test(newPassword)) {
    return "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.";
  }

  return null;
};

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

function PasswordChangePage({ user, onLogout }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitState, setSubmitState] = useState({ loading: false, error: "", success: "" });

  // 비로그인 사용자는 로그인 페이지로 보낸다
  if (!user) {
    return <Navigate replace to="/login" />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 제출 전 클라이언트 유효성 검사
    const clientError = validateForm(form);
    if (clientError) {
      setSubmitState({ loading: false, error: clientError, success: "" });
      return;
    }

    const authHeader = getAuthorizationHeader();
    if (!authHeader) {
      setSubmitState({ loading: false, error: "로그인 세션이 만료되었습니다. 다시 로그인해주세요.", success: "" });
      return;
    }

    try {
      setSubmitState({ loading: true, error: "", success: "" });

      const response = await fetch(AUTH_PASSWORD_API_URL, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { message: "서버 응답을 확인할 수 없습니다." };

      if (!response.ok) {
        throw new Error(data.message || "비밀번호 변경에 실패했습니다.");
      }

      // 성공 시 폼을 초기화하고 성공 메시지를 표시한다
      setForm(EMPTY_FORM);
      setSubmitState({ loading: false, error: "", success: data.message || "비밀번호가 변경되었습니다." });
    } catch (error) {
      setSubmitState({ loading: false, error: error.message || "비밀번호 변경에 실패했습니다.", success: "" });
    }
  };

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="account-page">
        <div className="account-page__heading">
          <p>내 계정</p>
          <h1>비밀번호 변경</h1>
        </div>

        <div className="account-page__layout">
          <AccountSidebar onLogout={onLogout} user={user} />

          <section className="account-page__content">
            <article className="account-page__panel">
              <div className="account-page__panel-header">
                <div>
                  <p>보안</p>
                  <h2>비밀번호 변경</h2>
                </div>
              </div>

              {/* 성공 메시지 */}
              {submitState.success && (
                <p className="account-page__success" role="status">
                  {submitState.success}
                </p>
              )}

              {/* 오류 메시지 */}
              {submitState.error && (
                <p className="account-page__error" role="alert">
                  {submitState.error}
                </p>
              )}

              <form className="account-page__field-grid" onSubmit={handleSubmit} noValidate>
                <label htmlFor="currentPassword">
                  <span>현재 비밀번호</span>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={form.currentPassword}
                    autoComplete="current-password"
                    onChange={handleChange}
                  />
                </label>

                <label htmlFor="newPassword">
                  <span>새 비밀번호</span>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={form.newPassword}
                    autoComplete="new-password"
                    onChange={handleChange}
                  />
                </label>

                <label htmlFor="confirmPassword">
                  <span>새 비밀번호 확인</span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    autoComplete="new-password"
                    onChange={handleChange}
                  />
                </label>

                <p className="account-page__muted">
                  비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.
                </p>

                <button
                  className="account-page__primary-button"
                  type="submit"
                  disabled={submitState.loading}
                >
                  {submitState.loading ? "변경 중..." : "비밀번호 변경"}
                </button>
              </form>
            </article>
          </section>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

export default PasswordChangePage;
