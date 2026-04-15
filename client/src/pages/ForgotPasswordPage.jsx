import { useState } from "react";
import { Link } from "react-router-dom";
import "./SearchPage.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <main className="forgot-password-page">
      <section className="forgot-password-page__card">
        <p
          style={{
            margin: 0,
            color: "#9a7b68",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          계정 복구
        </p>
        <h1>비밀번호를 재설정하세요</h1>
        <p>가입한 이메일 주소를 입력하면 비밀번호 재설정 안내를 보내드리는 흐름을 체험할 수 있습니다.</p>

        {isSubmitted ? (
          <>
            <p>
              <strong>{email}</strong> 주소로 재설정 링크를 보냈다고 가정한 데모 화면입니다.
            </p>
            <div className="forgot-password-page__actions">
              <button type="button" onClick={() => setIsSubmitted(false)}>
                다른 이메일 입력
              </button>
              <Link to="/login">로그인으로 돌아가기</Link>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              이메일
              <input
                required
                placeholder="example@email.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <div className="forgot-password-page__actions">
              <button type="submit">{isSubmitting ? "전송 중..." : "재설정 링크 보내기"}</button>
              <Link to="/login">취소</Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
