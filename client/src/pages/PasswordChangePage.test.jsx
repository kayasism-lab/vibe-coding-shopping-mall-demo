/**
 * PasswordChangePage 컴포넌트 단위 테스트
 * RED 단계: PasswordChangePage 모듈이 아직 존재하지 않으므로 모든 테스트 실패
 */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import PasswordChangePage from "./PasswordChangePage";

// 레이아웃 전용 컴포넌트를 단순 래퍼로 대체해 Provider 의존성을 제거한다
vi.mock("../components/store/StoreHeader", () => ({ default: () => <header data-testid="store-header" /> }));
vi.mock("../components/store/StoreFooter", () => ({ default: () => <footer data-testid="store-footer" /> }));
vi.mock("../components/store/CartSidebar", () => ({ default: () => null }));

// utils/auth 모킹 — 실제 localStorage에 의존하지 않도록 한다
vi.mock("../utils/auth", () => ({
  API_BASE_URL: "http://localhost:5000",
  AUTH_PASSWORD_API_URL: "http://localhost:5000/api/auth/password",
  getStoredSession: () => ({ tokenType: "Bearer" }),
  getAuthorizationHeader: () => "Bearer test-token",
}));

// react-router-dom useNavigate 모킹
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUser = { _id: "user-1", name: "홍길동", email: "test@example.com" };

function renderPage(user = mockUser) {
  return render(
    <MemoryRouter>
      <PasswordChangePage user={user} onLogout={vi.fn()} />
    </MemoryRouter>
  );
}

describe("PasswordChangePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockReset();
  });

  // --- 렌더링 ---
  it("비밀번호 변경 폼을 렌더링한다", () => {
    renderPage();
    expect(screen.getByLabelText("현재 비밀번호")).toBeInTheDocument();
    expect(screen.getByLabelText("새 비밀번호")).toBeInTheDocument();
    expect(screen.getByLabelText("새 비밀번호 확인")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /변경/i })).toBeInTheDocument();
  });

  it("user가 없으면 로그인 페이지로 리다이렉트한다", () => {
    renderPage(null);
    // Navigate 컴포넌트가 렌더됐으면 폼은 없다
    expect(screen.queryByLabelText(/현재 비밀번호/i)).not.toBeInTheDocument();
  });

  // --- 클라이언트 유효성 검증 ---
  it("모든 필드가 비어있으면 제출 시 에러 메시지를 표시한다", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /변경/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("새 비밀번호와 확인 비밀번호가 다르면 에러 메시지를 표시한다", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("현재 비밀번호"), { target: { value: "Old1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: "New1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: "Different1!" } });
    fireEvent.click(screen.getByRole("button", { name: /변경/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert").textContent).toMatch(/일치/);
  });

  it("새 비밀번호가 유효성 검증을 통과하지 못하면 에러 메시지를 표시한다", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("현재 비밀번호"), { target: { value: "Old1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: "weak" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: "weak" } });
    fireEvent.click(screen.getByRole("button", { name: /변경/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("새 비밀번호가 현재 비밀번호와 같으면 에러 메시지를 표시한다", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("현재 비밀번호"), { target: { value: "Old1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: "Old1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: "Old1!pass" } });
    fireEvent.click(screen.getByRole("button", { name: /변경/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert").textContent).toMatch(/현재 비밀번호와 같을 수 없습니다/);
  });

  // --- API 연동 ---
  it("서버 오류 응답을 받으면 에러 메시지를 표시한다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      headers: { get: () => "application/json" },
      json: async () => ({ message: "현재 비밀번호가 올바르지 않습니다." }),
    });

    renderPage();
    fireEvent.change(screen.getByLabelText("현재 비밀번호"), { target: { value: "Wrong1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: "New1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: "New1!pass" } });
    fireEvent.click(screen.getByRole("button", { name: /변경/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByRole("alert").textContent).toMatch(/현재 비밀번호/);
  });

  it("성공 응답을 받으면 성공 메시지를 표시하고 폼을 초기화한다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => ({ message: "비밀번호가 변경되었습니다." }),
    });

    renderPage();
    fireEvent.change(screen.getByLabelText("현재 비밀번호"), { target: { value: "Old1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: "New1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: "New1!pass" } });
    fireEvent.click(screen.getByRole("button", { name: /변경/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
    expect(screen.getByRole("status").textContent).toMatch(/변경/);
    // 폼 필드가 초기화된다
    expect(screen.getByLabelText("현재 비밀번호")).toHaveValue("");
  });

  it("제출 중에는 버튼이 비활성화된다", async () => {
    // fetch가 느리게 응답하는 시나리오
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));

    renderPage();
    fireEvent.change(screen.getByLabelText("현재 비밀번호"), { target: { value: "Old1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호"), { target: { value: "New1!pass" } });
    fireEvent.change(screen.getByLabelText("새 비밀번호 확인"), { target: { value: "New1!pass" } });
    fireEvent.click(screen.getByRole("button", { name: /변경/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /변경/i })).toBeDisabled();
    });
  });
});
