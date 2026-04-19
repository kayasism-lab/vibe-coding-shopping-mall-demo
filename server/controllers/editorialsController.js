const mongoose = require("mongoose");
const Editorial = require("../models/Editorial");

const formatOptions = ["manifesto", "lookbook", "studio-story"];
const statusOptions = ["draft", "published"];
const alignmentOptions = ["left", "center", "right"];
const publicProjection = { __v: 0 };

const pickFields = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
    return result;
  }, {});

const sanitizeText = (value) => String(value || "").trim();
const sanitizeSlug = (value) =>
  sanitizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const sanitizeHeroImagePercent = (value, fallback = 50) => {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(100, Math.max(0, n));
};

const sanitizeSkuArray = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => Number.parseInt(item, 10))
        .filter((item, index, array) => Number.isInteger(item) && item > 0 && array.indexOf(item) === index)
    : [];

const sanitizeSections = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          heading: sanitizeText(item?.heading),
          body: sanitizeText(item?.body),
          image: sanitizeText(item?.image),
          imageAlt: sanitizeText(item?.imageAlt),
        }))
        .filter((item) => item.heading || item.body || item.image)
    : [];

const sanitizeLooks = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          title: sanitizeText(item?.title),
          body: sanitizeText(item?.body),
          image: sanitizeText(item?.image),
          imageAlt: sanitizeText(item?.imageAlt),
          linkedSkus: sanitizeSkuArray(item?.linkedSkus),
        }))
        .filter((item) => item.title || item.body || item.image)
    : [];

const sanitizeGallery = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          image: sanitizeText(item?.image),
          alt: sanitizeText(item?.alt),
        }))
        .filter((item) => item.image)
    : [];

const sanitizeEventBlocks = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          eyebrow: sanitizeText(item?.eyebrow),
          title: sanitizeText(item?.title),
          copy: sanitizeText(item?.copy),
          image: sanitizeText(item?.image),
          imageAlt: sanitizeText(item?.imageAlt),
          ctaLabel: sanitizeText(item?.ctaLabel),
          ctaHref: sanitizeText(item?.ctaHref),
          alignment: alignmentOptions.includes(sanitizeText(item?.alignment))
            ? sanitizeText(item?.alignment)
            : "left",
        }))
        .filter((item) => item.title || item.copy || item.image)
        .slice(0, 3)
    : [];

const editorialFields = [
  "slug",
  "title",
  "label",
  "subtitle",
  "format",
  "status",
  "heroImage",
  "heroImageAlt",
  "heroImagePosX",
  "heroImagePosY",
  "intro",
  "eventBlocks",
  "closingCtaLabel",
  "closingCtaHref",
  "relatedProductSkus",
  "manifestoSections",
  "looks",
  "processSections",
  "galleryImages",
];

const normalizeEditorialPayload = (payload) => ({
  slug: sanitizeSlug(payload.slug),
  title: sanitizeText(payload.title),
  label: sanitizeText(payload.label),
  subtitle: sanitizeText(payload.subtitle),
  format: sanitizeText(payload.format),
  status: sanitizeText(payload.status) || "draft",
  heroImage: sanitizeText(payload.heroImage),
  heroImageAlt: sanitizeText(payload.heroImageAlt) || sanitizeText(payload.title),
  heroImagePosX: sanitizeHeroImagePercent(payload.heroImagePosX),
  heroImagePosY: sanitizeHeroImagePercent(payload.heroImagePosY),
  intro: sanitizeText(payload.intro),
  eventBlocks: sanitizeEventBlocks(payload.eventBlocks),
  closingCtaLabel: sanitizeText(payload.closingCtaLabel),
  closingCtaHref: sanitizeText(payload.closingCtaHref),
  relatedProductSkus: sanitizeSkuArray(payload.relatedProductSkus),
  manifestoSections: sanitizeSections(payload.manifestoSections),
  looks: sanitizeLooks(payload.looks),
  processSections: sanitizeSections(payload.processSections),
  galleryImages: sanitizeGallery(payload.galleryImages),
});

const validateEditorialPayload = (payload) => {
  if (!payload.slug) return "슬러그를 입력해주세요.";
  if (!payload.title) return "제목을 입력해주세요.";
  if (!formatOptions.includes(payload.format)) return "허용되지 않은 포맷입니다.";
  if (!statusOptions.includes(payload.status)) return "허용되지 않은 공개 상태입니다.";
  if (!payload.heroImage) return "히어로 이미지를 입력해주세요.";
  if (!payload.intro) return "인트로 문구를 입력해주세요.";
  if (payload.eventBlocks.length === 0) return "이벤트 블록을 1개 이상 입력해주세요.";
  if (payload.eventBlocks.length > 3) return "이벤트 블록은 최대 3개까지만 허용됩니다.";

  if (payload.format === "manifesto" && payload.manifestoSections.length === 0) {
    return "manifesto 포맷에는 섹션이 1개 이상 필요합니다.";
  }

  if (payload.format === "lookbook" && payload.looks.length === 0) {
    return "lookbook 포맷에는 룩이 1개 이상 필요합니다.";
  }

  if (payload.format === "studio-story" && payload.processSections.length === 0) {
    return "studio-story 포맷에는 프로세스 섹션이 1개 이상 필요합니다.";
  }

  return "";
};

const getEditorials = async (_req, res) => {
  try {
    const editorials = await Editorial.find({ status: "published" })
      .sort({ homeOrder: 1, createdAt: -1 })
      .select(publicProjection)
      .lean();
    res.json(editorials);
  } catch (error) {
    res.status(500).json({ message: "에디토리얼 목록 조회에 실패했습니다.", error: error.message });
  }
};

const getEditorial = async (req, res) => {
  try {
    const slug = sanitizeSlug(req.params.slug);
    const editorial = await Editorial.findOne({ slug, status: "published" })
      .select(publicProjection)
      .lean();

    if (!editorial) {
      return res.status(404).json({ message: "에디토리얼을 찾을 수 없습니다." });
    }

    return res.json(editorial);
  } catch (error) {
    return res.status(500).json({ message: "에디토리얼 조회에 실패했습니다.", error: error.message });
  }
};

const getAdminEditorials = async (_req, res) => {
  try {
    const editorials = await Editorial.find().sort({ homeOrder: 1, createdAt: -1 }).lean();
    res.json(editorials);
  } catch (error) {
    res.status(500).json({ message: "관리자 에디토리얼 조회에 실패했습니다.", error: error.message });
  }
};

const createEditorial = async (req, res) => {
  try {
    const payload = normalizeEditorialPayload(pickFields(req.body, editorialFields));
    const validationMessage = validateEditorialPayload(payload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const maxDoc = await Editorial.findOne().sort({ homeOrder: -1 }).select("homeOrder").lean();
    const nextHomeOrder =
      maxDoc && typeof maxDoc.homeOrder === "number" && !Number.isNaN(maxDoc.homeOrder)
        ? maxDoc.homeOrder + 1
        : 0;

    const createdEditorial = await Editorial.create({ ...payload, homeOrder: nextHomeOrder });
    return res.status(201).json(createdEditorial);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "이미 사용 중인 슬러그입니다." });
    }

    return res.status(400).json({ message: "에디토리얼 생성에 실패했습니다.", error: error.message });
  }
};

const updateEditorial = async (req, res) => {
  try {
    const payload = normalizeEditorialPayload(pickFields(req.body, editorialFields));
    const validationMessage = validateEditorialPayload(payload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const updatedEditorial = await Editorial.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedEditorial) {
      return res.status(404).json({ message: "에디토리얼을 찾을 수 없습니다." });
    }

    return res.json(updatedEditorial);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "이미 사용 중인 슬러그입니다." });
    }

    return res.status(400).json({ message: "에디토리얼 수정에 실패했습니다.", error: error.message });
  }
};

const reorderEditorials = async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds 배열이 필요합니다." });
    }

    const validIds = orderedIds.filter((id) => mongoose.Types.ObjectId.isValid(String(id)));

    if (validIds.length !== orderedIds.length) {
      return res.status(400).json({ message: "유효하지 않은 ID가 포함되어 있습니다." });
    }

    const allDocs = await Editorial.find().select("_id").lean();

    if (allDocs.length !== validIds.length) {
      return res.status(400).json({ message: "등록된 에디토리얼 개수와 순서 배열 길이가 맞지 않습니다." });
    }

    const idStrings = new Set(allDocs.map((doc) => String(doc._id)));

    for (const id of validIds) {
      if (!idStrings.has(String(id))) {
        return res.status(400).json({ message: "목록에 없는 에디토리얼 ID가 포함되어 있습니다." });
      }
    }

    const bulkOps = validIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { homeOrder: index } },
      },
    }));

    await Editorial.bulkWrite(bulkOps);
    const editorials = await Editorial.find().sort({ homeOrder: 1, createdAt: -1 }).lean();
    return res.json(editorials);
  } catch (error) {
    return res.status(500).json({ message: "순서 저장에 실패했습니다.", error: error.message });
  }
};

const deleteEditorial = async (req, res) => {
  try {
    const deletedEditorial = await Editorial.findByIdAndDelete(req.params.id).lean();

    if (!deletedEditorial) {
      return res.status(404).json({ message: "에디토리얼을 찾을 수 없습니다." });
    }

    return res.json({ message: "에디토리얼을 삭제했습니다.", editorial: deletedEditorial });
  } catch (error) {
    return res.status(500).json({ message: "에디토리얼 삭제에 실패했습니다.", error: error.message });
  }
};

module.exports = {
  getEditorials,
  getEditorial,
  getAdminEditorials,
  createEditorial,
  updateEditorial,
  reorderEditorials,
  deleteEditorial,
};
