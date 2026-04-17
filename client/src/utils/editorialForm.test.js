import { describe, expect, it } from "vitest";
import { normalizeEditorialPayload } from "./editorialForm";

describe("normalizeEditorialPayload", () => {
  it("히어로 alt가 비어 있으면 제목을 기본값으로 사용한다", () => {
    const payload = normalizeEditorialPayload({
      formData: {
        slug: "behind-the-story",
        title: "비하인드 스토리",
        label: "스튜디오",
        subtitle: "설명",
        format: "studio-story",
        status: "published",
        heroImage: "https://example.com/hero.jpg",
        heroImageAlt: "",
        intro: "인트로",
        closingCtaLabel: "",
        closingCtaHref: "",
        relatedProductSkusText: "",
      },
      eventBlocks: [{ title: "카드", copy: "설명", image: "https://example.com/card.jpg" }],
      manifestoSections: [],
      looks: [],
      processSections: [{ heading: "섹션", body: "본문", image: "https://example.com/section.jpg" }],
      galleryImages: [],
    });

    expect(payload.heroImageAlt).toBe("비하인드 스토리");
  });
});
