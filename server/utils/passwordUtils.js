/**
 * 비밀번호 유효성 검증 유틸리티
 * 영문·숫자·특수문자 포함 8자 이상 규칙을 User 모델과 공유한다.
 */

// User 모델에 정의된 것과 동일한 패턴을 사용한다
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

/**
 * 비밀번호가 정책을 만족하는지 검사한다.
 * @param {string|null|undefined} password
 * @returns {boolean}
 */
const isValidPassword = (password) => {
  if (!password) {
    return false;
  }

  return PASSWORD_PATTERN.test(password);
};

/**
 * 비밀번호 유효성 오류 메시지를 반환한다. 유효하면 null을 반환한다.
 * @param {string|null|undefined} password
 * @returns {string|null}
 */
const getPasswordValidationMessage = (password) => {
  if (!password) {
    return "비밀번호를 입력해주세요.";
  }

  if (!isValidPassword(password)) {
    return "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.";
  }

  return null;
};

module.exports = { isValidPassword, getPasswordValidationMessage };
