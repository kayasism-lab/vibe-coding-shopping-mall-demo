import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import StoreFooter from "./StoreFooter";

describe("StoreFooter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a coming soon popup for footer links", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<StoreFooter />);

    await user.click(screen.getByRole("button", { name: "고객센터" }));

    expect(alertSpy).toHaveBeenCalledWith("고객센터 페이지는 준비 중입니다.");
  });
});
