import { describe, expect, it } from "vitest";
import { editorialHomeOrder } from "./editorials";

describe("editorialHomeOrder", () => {
  it("홈 에디토리얼 순서를 3, 2, 1 순서로 유지한다", () => {
    expect(editorialHomeOrder).toEqual([
      "behind-the-story",
      "spring-lookbook",
      "minimalism-of-light",
    ]);
  });
});
