const HomeContent = require("../models/HomeContent");
const seedHomeContent = require("../data/seedHomeContent");

const VALID_MOOD_SLUGS = new Set(["women", "men", "new", "accessories", "outerwear", "all"]);

const normalizeHeroSlide = (slide, index) => {
  const id = String(slide?.id || slide?._id || `hero-slide-${index + 1}`).trim();
  return {
    id,
    image: String(slide?.image || "").trim(),
    subtitle: String(slide?.subtitle || "").trim(),
    title: String(slide?.title || "").trim(),
    description: String(slide?.description || "").trim(),
    ctaLabel: String(slide?.ctaLabel || "신상품 보기").trim() || "신상품 보기",
    ctaHref: String(slide?.ctaHref || "#products").trim() || "#products",
  };
};

const normalizeMoodCategory = (item) => ({
  title: String(item?.title || "").trim(),
  slug: String(item?.slug || "").trim().toLowerCase(),
  description: String(item?.description || "").trim(),
  image: String(item?.image || "").trim(),
});

const validatePayload = (body) => {
  const errors = [];
  const heroSlides = Array.isArray(body?.heroSlides)
    ? body.heroSlides.map((slide, index) => normalizeHeroSlide(slide, index))
    : [];

  if (heroSlides.length < 1) {
    errors.push("히어로 슬라이드는 최소 1개 필요합니다.");
  }

  if (heroSlides.length > 12) {
    errors.push("히어로 슬라이드는 최대 12개까지 설정할 수 있습니다.");
  }

  for (let i = 0; i < heroSlides.length; i += 1) {
    const slide = heroSlides[i];
    if (!slide.image) {
      errors.push(`슬라이드 ${i + 1}: 이미지 URL이 필요합니다.`);
    }
    if (!slide.title) {
      errors.push(`슬라이드 ${i + 1}: 제목이 필요합니다.`);
    }
  }

  const moodCategories = Array.isArray(body?.moodCategories)
    ? body.moodCategories.map((item) => normalizeMoodCategory(item))
    : [];

  if (moodCategories.length < 1) {
    errors.push("Shop by Mood 카드는 최소 1개 필요합니다.");
  }

  if (moodCategories.length > 12) {
    errors.push("Shop by Mood 카드는 최대 12개까지 설정할 수 있습니다.");
  }

  for (let i = 0; i < moodCategories.length; i += 1) {
    const cat = moodCategories[i];
    if (!cat.title) {
      errors.push(`무드 카드 ${i + 1}: 제목이 필요합니다.`);
    }
    if (!cat.slug || !VALID_MOOD_SLUGS.has(cat.slug)) {
      errors.push(
        `무드 카드 ${i + 1}: 연결 경로(slug)는 women, men, new, accessories, outerwear, all 중 하나여야 합니다.`
      );
    }
    if (!cat.image) {
      errors.push(`무드 카드 ${i + 1}: 이미지 URL이 필요합니다.`);
    }
  }

  const moodEyebrow = String(body?.moodEyebrow ?? "").trim() || "Collection";
  const moodTitle = String(body?.moodTitle ?? "").trim() || "Shop by Mood";

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      moodEyebrow,
      moodTitle,
      heroSlides,
      moodCategories,
    },
  };
};

const getHomeContent = async (req, res) => {
  try {
    let doc = await HomeContent.findOne({ documentKey: "home" }).lean();

    if (!doc) {
      doc = await HomeContent.create(seedHomeContent);
      doc = doc.toObject();
    }

    const {
      moodEyebrow,
      moodTitle,
      heroSlides = [],
      moodCategories = [],
      updatedAt,
    } = doc;

    return res.json({
      moodEyebrow,
      moodTitle,
      heroSlides,
      moodCategories,
      updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "메인 콘텐츠를 불러오지 못했습니다." });
  }
};

const updateHomeContent = async (req, res) => {
  const parsed = validatePayload(req.body);

  if (!parsed.ok) {
    return res.status(400).json({ message: parsed.errors.join(" "), errors: parsed.errors });
  }

  try {
    const updated = await HomeContent.findOneAndUpdate(
      { documentKey: "home" },
      {
        $set: {
          documentKey: "home",
          moodEyebrow: parsed.value.moodEyebrow,
          moodTitle: parsed.value.moodTitle,
          heroSlides: parsed.value.heroSlides,
          moodCategories: parsed.value.moodCategories,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({
      moodEyebrow: updated.moodEyebrow,
      moodTitle: updated.moodTitle,
      heroSlides: updated.heroSlides,
      moodCategories: updated.moodCategories,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "메인 콘텐츠를 저장하지 못했습니다." });
  }
};

module.exports = {
  getHomeContent,
  updateHomeContent,
};
