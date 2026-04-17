import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EditorialImageField from "./EditorialImageField";

describe("EditorialImageField", () => {
  it("URL이 있으면 미리보기를 함께 보여준다", () => {
    render(
      <EditorialImageField
        label="hero image"
        previewAlt="미리보기"
        value="https://example.com/image.jpg"
        onChange={vi.fn()}
        onUpload={vi.fn()}
      />
    );

    expect(screen.getByRole("img", { name: "미리보기" })).toHaveAttribute(
      "src",
      "https://example.com/image.jpg"
    );
  });

  it("업로드 버튼과 URL 입력 변경 콜백을 호출한다", () => {
    const handleChange = vi.fn();
    const handleUpload = vi.fn();

    render(
      <EditorialImageField
        label="hero image"
        previewAlt="미리보기"
        value=""
        onChange={handleChange}
        onUpload={handleUpload}
      />
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "https://example.com/next.jpg" } });
    fireEvent.click(screen.getByRole("button", { name: "업로드" }));

    expect(handleChange).toHaveBeenCalledWith("https://example.com/next.jpg");
    expect(handleUpload).toHaveBeenCalledTimes(1);
  });
});
