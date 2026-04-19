import { categories as fallbackCategories, heroSlides as fallbackHeroSlides } from "../data/catalog";
import { parseSkuText } from "./editorialForm";

/** 히어로 버튼 연결용 SKU 문자열 정규화 (순서 유지, 중복 제거) */
export const formatCtaProductSkus = (value) => {
  const skus = parseSkuText(value);
  return skus.join(", ");
};

export const MOOD_SLUG_OPTIONS = [
  { value: "women", label: "Women (women)" },
  { value: "men", label: "Men (men)" },
  { value: "new", label: "New In (new)" },
  { value: "accessories", label: "Accessories (accessories)" },
  { value: "outerwear", label: "Outerwear (outerwear)" },
  { value: "all", label: "All (all)" },
];

const clampImagePercent = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 50;
  }
  return Math.min(100, Math.max(0, n));
};

export const createEmptyHeroSlide = () => ({
  id: `hero-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`,
  image: "",
  imagePosX: 50,
  imagePosY: 50,
  subtitle: "",
  title: "",
  description: "",
  ctaLabel: "신상품 보기",
  ctaProductSkus: "",
});

export const createEmptyMoodCategory = () => ({
  title: "",
  slug: "women",
  description: "",
  image: "",
});

export const normalizeHeroSlide = (slide, index) => ({
  id: String(slide?.id || `hero-slide-${index + 1}`).trim(),
  image: String(slide?.image || "").trim(),
  imagePosX: clampImagePercent(slide?.imagePosX),
  imagePosY: clampImagePercent(slide?.imagePosY),
  subtitle: String(slide?.subtitle || "").trim(),
  title: String(slide?.title || "").trim(),
  description: String(slide?.description || "").trim(),
  ctaLabel: String(slide?.ctaLabel || "신상품 보기").trim() || "신상품 보기",
  ctaProductSkus: formatCtaProductSkus(slide?.ctaProductSkus),
});

export const normalizeMoodCategory = (item) => ({
  title: String(item?.title || "").trim(),
  slug: String(item?.slug || "").trim().toLowerCase(),
  description: String(item?.description || "").trim(),
  image: String(item?.image || "").trim(),
});

export const getFallbackHomeContent = () => ({
  moodEyebrow: "Collection",
  moodTitle: "Shop by Mood",
  heroSlides: fallbackHeroSlides.map((slide, index) => normalizeHeroSlide(slide, index)),
  moodCategories: fallbackCategories.map(normalizeMoodCategory),
});
