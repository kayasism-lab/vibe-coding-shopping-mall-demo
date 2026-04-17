/**
 * 비밀번호 유효성 검증 유틸리티 단위 테스트
 * RED 단계: passwordUtils 모듈이 아직 존재하지 않으므로 모든 테스트 실패
 */

const { isValidPassword, getPasswordValidationMessage } = require("./passwordUtils");

describe("isValidPassword", () => {
  it("8자 미만 비밀번호는 false를 반환한다", () => {
    expect(isValidPassword("Ab1!")).toBe(false);
    expect(isValidPassword("Ab1!234")).toBe(false);
  });

  it("영문이 없는 비밀번호는 false를 반환한다", () => {
    expect(isValidPassword("12345678!")).toBe(false);
  });

  it("숫자가 없는 비밀번호는 false를 반환한다", () => {
    expect(isValidPassword("Abcdefg!")).toBe(false);
  });

  it("특수문자가 없는 비밀번호는 false를 반환한다", () => {
    expect(isValidPassword("Abcdefg1")).toBe(false);
  });

  it("영문·숫자·특수문자를 모두 포함하고 8자 이상이면 true를 반환한다", () => {
    expect(isValidPassword("Abcdef1!")).toBe(true);
    expect(isValidPassword("MyPass123@")).toBe(true);
  });

  it("빈 문자열은 false를 반환한다", () => {
    expect(isValidPassword("")).toBe(false);
  });

  it("null/undefined는 false를 반환한다", () => {
    expect(isValidPassword(null)).toBe(false);
    expect(isValidPassword(undefined)).toBe(false);
  });
});

describe("getPasswordValidationMessage", () => {
  it("비밀번호가 없으면 입력 요청 메시지를 반환한다", () => {
    expect(getPasswordValidationMessage("")).toBeTruthy();
    expect(getPasswordValidationMessage(null)).toBeTruthy();
  });

  it("유효하지 않은 비밀번호는 검증 실패 메시지를 반환한다", () => {
    expect(getPasswordValidationMessage("short1!")).toBeTruthy();
  });

  it("유효한 비밀번호는 null을 반환한다", () => {
    expect(getPasswordValidationMessage("Valid1!pass")).toBeNull();
  });
});
