import { useState } from "react";
import { USERS_API_URL } from "../utils/auth";
import "./SignupPage.css";

const initialForm = {
  name: "",
  email: "",
  contact: "",
  password: "",
  confirmPassword: "",
  addressLabel: "",
  address: "",
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(02-\d{3,4}-\d{4}|0\d{2}-\d{3,4}-\d{4})$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const sanitizeManualContactNumber = (value) => {
  let digitCount = 0;
  let dashCount = 0;
  let result = "";

  for (const char of value) {
    if (/\d/.test(char)) {
      if (digitCount >= 11) {
        continue;
      }

      result += char;
      digitCount += 1;
      continue;
    }

    if (char === "-") {
      const lastChar = result[result.length - 1];

      if (!result || lastChar === "-" || dashCount >= 2) {
        continue;
      }

      result += char;
      dashCount += 1;
    }
  }

  return result.endsWith("-") ? result.slice(0, -1) : result;
};

const formatContactNumber = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.startsWith("02")) {
    const rest = digits.slice(2);

    if (!rest) {
      return "02";
    }

    if (rest.length <= 3) {
      return `02-${rest}`;
    }

    if (rest.length <= 6) {
      return `02-${rest}`;
    }

    return `02-${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
  }

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

const normalizeContactInput = (value, previousValue, nativeEvent) => {
  const insertedDash =
    nativeEvent?.data === "-" ||
    (nativeEvent?.inputType === "insertText" && value === `${previousValue}-`);

  if (insertedDash) {
    return sanitizeManualContactNumber(value);
  }

  return formatContactNumber(value);
};

const createSignupPayload = (form) => {
  const requiredTermsAgreed = form.agreeTerms && form.agreePrivacy ? 1 : 0;
  const optionalTermsAgreed = form.agreeMarketing ? 1 : 0;
  const payload = {
    email: form.email.trim(),
    name: form.name.trim(),
    password: form.password,
    contact: form.contact.replace(/\D/g, ""),
    requiredTermsAgreed,
    optionalTermsAgreed,
    userType: "customer",
  };

  if (form.address.trim()) {
    payload.addresses = [
      {
        label: form.addressLabel.trim(),
        address: form.address.trim(),
      },
    ];
  }

  return payload;
};

const createUser = async (payload) => {
  const response = await fetch(USERS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: "서버 응답을 확인할 수 없습니다." };

  if (!response.ok) {
    throw new Error(data.message || "회원가입에 실패했습니다.");
  }

  return data;
};
function SignupPage({ onBack }) {
  const [form, setForm] = useState(initialForm);
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitState, setSubmitState] = useState({
    loading: false,
    error: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const allRequiredAgreed = form.agreeTerms && form.agreePrivacy;
  const allAgreed = allRequiredAgreed && form.agreeMarketing;
  const emailHasError = emailTouched && form.email.trim() && !emailPattern.test(form.email.trim());
  const isSubmitReady =
    form.name.trim() &&
    form.email.trim() &&
    form.contact.trim() &&
    form.password &&
    form.confirmPassword &&
    allRequiredAgreed;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nativeEvent = event.nativeEvent;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "contact"
            ? normalizeContactInput(value, prev.contact, nativeEvent)
            : value,
    }));
  };

  const handleAllAgreeChange = (event) => {
    const checked = event.target.checked;

    setForm((prev) => ({
      ...prev,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
    }));
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  const validateForm = () => {
    const validationMessages = [];

    if (!form.name.trim()) {
      validationMessages.push("성함을 입력해주세요.");
    }

    if (!form.email.trim()) validationMessages.push("이메일을 입력해주세요.");
    if (!form.contact.trim()) validationMessages.push("전화번호를 입력해주세요.");
    if (!form.password) validationMessages.push("비밀번호를 입력해주세요.");
    if (!form.confirmPassword) validationMessages.push("비밀번호 확인을 입력해주세요.");

    if (form.email.trim() && !emailPattern.test(form.email.trim())) {
      validationMessages.push("이메일 형식이 올바르지 않습니다.");
    }

    if (form.contact.trim() && !phonePattern.test(form.contact.trim())) {
      validationMessages.push("전화번호 형식이 올바르지 않습니다.");
    }

    if (form.address.trim() && form.addressLabel.trim().length < 1) {
      return "주소 별칭은 한 글자 이상 입력해주세요.";
    }

    if (form.addressLabel.trim() && !form.address.trim()) {
      return "주소를 입력하지 않았다면 주소 별칭도 비워주세요.";
    }

    if (form.password && !passwordPattern.test(form.password)) {
      validationMessages.push(
        "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다."
      );
    }

    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      validationMessages.push("비밀번호 확인이 일치하지 않습니다.");
    }

    if (!allRequiredAgreed) {
      return "필수 약관에 동의해주세요.";
    }

    if (validationMessages.length > 0) {
      return [...new Set(validationMessages)].join("\n");
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      setSubmitState({ loading: false, error: errorMessage });
      return;
    }

    try {
      setSubmitState({ loading: true, error: "" });
      const payload = createSignupPayload(form);
      await createUser(payload);

      setSubmitState({ loading: false, error: "" });
      setForm(initialForm);
      setEmailTouched(false);
      setShowSuccessModal(true);
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error.message || "회원가입에 실패했습니다.",
      });
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    onBack();
  };

  return (
    <section className="signup-page">
      <div className="signup-card">
        <button className="home-button" type="button" onClick={onBack} aria-label="홈으로 이동">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5.25 9.75V21h13.5V9.75" />
            <path d="M10 21v-6h4v6" />
          </svg>
        </button>

        <header className="signup-header">
          <h1>회원가입</h1>
          <p>새로운 계정을 만들어 쇼핑을 시작하세요</p>
        </header>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="field-label">
              <span className="required-mark">*</span>
              성함
            </span>
            <input
              name="name"
              type="text"
              placeholder="홍길동"
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span className="field-label">
              <span className="required-mark">*</span>
              이메일
              {emailHasError ? (
                <small className="inline-error">이메일 형식에 맞게 입력해주세요.</small>
              ) : null}
            </span>
            <input
              name="email"
              type="text"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
            />
          </label>

          <label className="form-field">
            <span className="field-label">
              <span className="required-mark">*</span>
              전화번호
              <small className="field-help">번호만 입력하세요</small>
            </span>
            <input
              name="contact"
              type="tel"
              placeholder="010-1234-5678"
              value={form.contact}
              onChange={handleChange}
            />
          </label>

          <label className="form-field">
            <span className="field-label">
              <span className="required-mark">*</span>
              비밀번호
            </span>
            <input
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={form.password}
              onChange={handleChange}
            />
            <small>8자 이상, 영문, 숫자, 특수문자 조합</small>
          </label>

          <label className="form-field">
            <span className="field-label">
              <span className="required-mark">*</span>
              비밀번호 확인
            </span>
            <input
              name="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </label>

          <div className="optional-section">
            <div className="section-title">선택 주소 정보</div>

            <label className="form-field">
              <span>주소 별칭</span>
              <input
                name="addressLabel"
                type="text"
                placeholder="우리집"
                value={form.addressLabel}
                onChange={handleChange}
              />
            </label>

            <label className="form-field">
              <span>주소</span>
              <input
                name="address"
                type="text"
                placeholder="서울시 강남구 ..."
                value={form.address}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="terms-box">
            <div className="section-title">
              <span className="required-mark">*</span>
              약관 동의
            </div>

            <label className="check-row strong">
              <input type="checkbox" checked={allAgreed} onChange={handleAllAgreeChange} />
              <span>전체 동의</span>
            </label>

            <label className="check-row">
              <input
                name="agreeTerms"
                type="checkbox"
                checked={form.agreeTerms}
                onChange={handleChange}
              />
              <span>이용약관 동의(필수)</span>
              <button className="link-button" type="button">
                보기
              </button>
            </label>

            <label className="check-row">
              <input
                name="agreePrivacy"
                type="checkbox"
                checked={form.agreePrivacy}
                onChange={handleChange}
              />
              <span>개인정보처리방침 동의 (필수)</span>
              <button className="link-button" type="button">
                보기
              </button>
            </label>

            <label className="check-row">
              <input
                name="agreeMarketing"
                type="checkbox"
                checked={form.agreeMarketing}
                onChange={handleChange}
              />
              <span>마케팅 정보 수신 동의 (선택)</span>
              <button className="link-button" type="button">
                보기
              </button>
            </label>
          </div>

          {submitState.error ? <p className="form-message error">{submitState.error}</p> : null}

          <button
            className={`submit-button ${isSubmitReady && !submitState.loading ? "active" : ""}`}
            type="submit"
            disabled={submitState.loading}
          >
            {submitState.loading ? "가입 중..." : "회원가입"}
          </button>
        </form>
      </div>

      {showSuccessModal ? (
        <div className="success-modal-backdrop" role="dialog" aria-modal="true">
          <div className="success-modal">
            <h2>회원가입이 완료되었습니다.</h2>
            <p>감사합니다.</p>
            <button className="success-confirm-button" type="button" onClick={handleSuccessConfirm}>
              확인
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default SignupPage;
