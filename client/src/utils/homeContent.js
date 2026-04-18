import { categories as fallbackCategories, heroSlides as fallbackHeroSlides } from "../data/catalog";

export const MOOD_SLUG_OPTIONS = [
  { value: "women", label: "Women (women)" },
  { value: "men", label: "Men (men)" },
  { value: "new", label: "New In (new)" },
  { value: "accessories", label: "Accessories (accessories)" },
  { value: "outerwear", label: "Outerwear (outerwear)" },
  { value: "all", label: "All (all)" },
];

export const createEmptyHeroSlide = () => ({
  id: `hero-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`,
  image: "",
  subtitle: "",
  title: "",
  description: "",
  ctaLabel: "신상품 보기",
  ctaHref: "#products",
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
  subtitle: String(slide?.subtitle || "").trim(),
  title: String(slide?.title || "").trim(),
  description: String(slide?.description || "").trim(),
  ctaLabel: String(slide?.ctaLabel || "신상품 보기").trim() || "신상품 보기",
  ctaHref: String(slide?.ctaHref || "#products").trim() || "#products",
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
