import { describe, expect, it } from "vitest";
import { fallbackEditorials } from "./editorials";

describe("fallbackEditorials", () => {
  it("오프라인 폴백에 homeOrder가 있어 홈 순서 정렬에 쓸 수 있다", () => {
    const orders = fallbackEditorials.map((item) => item.homeOrder);
    expect(orders.sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });
});
