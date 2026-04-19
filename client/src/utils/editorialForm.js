export const parseSkuText = (value) =>
  String(value || "")
    .split(",")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item, index, array) => Number.isInteger(item) && item > 0 && array.indexOf(item) === index);

const trim = (value) => String(value || "").trim();

const clampHeroPercent = (value, fallback = 50) => {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(100, Math.max(0, n));
};

export const normalizeEditorialPayload = ({
  formData,
  eventBlocks,
  manifestoSections,
  looks,
  processSections,
  galleryImages,
}) => ({
  slug: trim(formData.slug),
  title: trim(formData.title),
  label: trim(formData.label),
  subtitle: trim(formData.subtitle),
  format: trim(formData.format),
  status: trim(formData.status),
  heroImage: trim(formData.heroImage),
  heroImageAlt: trim(formData.heroImageAlt) || trim(formData.title),
  heroImagePosX: clampHeroPercent(formData.heroImagePosX),
  heroImagePosY: clampHeroPercent(formData.heroImagePosY),
  intro: trim(formData.intro),
  eventBlocks: eventBlocks
    .map((item) => ({
      eyebrow: trim(item.eyebrow),
      title: trim(item.title),
      copy: trim(item.copy),
      image: trim(item.image),
      imageAlt: trim(item.imageAlt),
      ctaLabel: trim(item.ctaLabel),
      ctaHref: trim(item.ctaHref),
      alignment: ["left", "center", "right"].includes(trim(item.alignment))
        ? trim(item.alignment)
        : "left",
    }))
    .filter((item) => item.title || item.copy || item.image)
    .slice(0, 3),
  closingCtaLabel: trim(formData.closingCtaLabel),
  closingCtaHref: trim(formData.closingCtaHref),
  relatedProductSkus:
    trim(formData.slug).toLowerCase() === "behind-the-story"
      ? []
      : parseSkuText(formData.relatedProductSkusText),
  manifestoSections: manifestoSections
    .map((item) => ({
      heading: trim(item.heading),
      body: trim(item.body),
      image: trim(item.image),
      imageAlt: trim(item.imageAlt),
    }))
    .filter((item) => item.heading || item.body || item.image),
  looks: looks
    .map((item) => ({
      title: trim(item.title),
      body: trim(item.body),
      image: trim(item.image),
      imageAlt: trim(item.imageAlt),
      linkedSkus: parseSkuText(item.linkedSkusText),
    }))
    .filter((item) => item.title || item.body || item.image),
  processSections: processSections
    .map((item) => ({
      heading: trim(item.heading),
      body: trim(item.body),
      image: trim(item.image),
      imageAlt: trim(item.imageAlt),
    }))
    .filter((item) => item.heading || item.body || item.image),
  galleryImages: galleryImages
    .map((item) => ({
      image: trim(item.image),
      alt: trim(item.alt),
    }))
    .filter((item) => item.image),
});

export const getEditorialValidationMessage = (payload) => {
  if (!payload.slug) return "슬러그를 입력해주세요.";
  if (!payload.title) return "제목을 입력해주세요.";
  if (!payload.heroImage) return "히어로 이미지를 입력해주세요.";
  if (!payload.intro) return "인트로를 입력해주세요.";
  if (!Array.isArray(payload.eventBlocks) || payload.eventBlocks.length === 0) {
    return "이벤트 블록을 1개 이상 입력해주세요.";
  }
  if (payload.eventBlocks.length > 3) {
    return "이벤트 블록은 최대 3개까지만 허용됩니다.";
  }

  if (payload.format === "manifesto" && payload.manifestoSections.length === 0) {
    return "Manifesto 섹션을 1개 이상 입력해주세요.";
  }

  if (payload.format === "lookbook" && payload.looks.length === 0) {
    return "룩 항목을 1개 이상 입력해주세요.";
  }

  if (payload.format === "studio-story" && payload.processSections.length === 0) {
    return "프로세스 섹션을 1개 이상 입력해주세요.";
  }

  return "";
};
