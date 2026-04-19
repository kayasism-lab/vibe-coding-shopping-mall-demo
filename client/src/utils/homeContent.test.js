import { describe, expect, it } from "vitest";
import {
  normalizeHeroSlide,
  normalizeMoodCategory,
  getFallbackHomeContent,
} from "./homeContent";

describe("normalizeHeroSlide", () => {
  it("fills id and CTA defaults", () => {
    const slide = normalizeHeroSlide({ title: "T" }, 2);
    expect(slide.id).toBe("hero-slide-3");
    expect(slide.ctaLabel).toBe("신상품 보기");
    expect(slide.ctaHref).toBe("#products");
    expect(slide.imagePosX).toBe(50);
    expect(slide.imagePosY).toBe(50);
  });
});

describe("normalizeMoodCategory", () => {
  it("lowercases slug", () => {
    expect(normalizeMoodCategory({ title: "A", slug: "WOMEN" }).slug).toBe("women");
  });
});

describe("getFallbackHomeContent", () => {
  it("returns non-empty slides and categories", () => {
    const data = getFallbackHomeContent();
    expect(data.heroSlides.length).toBeGreaterThan(0);
    expect(data.moodCategories.length).toBeGreaterThan(0);
  });
});
