const mongoose = require("mongoose");

const { Schema, model, models } = mongoose;
const formatOptions = ["manifesto", "lookbook", "studio-story"];
const statusOptions = ["draft", "published"];
const alignmentOptions = ["left", "center", "right"];

const imageBlockSchema = new Schema(
  {
    image: { type: String, trim: true, default: "" },
    alt: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    heading: { type: String, trim: true, default: "" },
    body: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    imageAlt: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const lookSchema = new Schema(
  {
    title: { type: String, trim: true, default: "" },
    body: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    imageAlt: { type: String, trim: true, default: "" },
    linkedSkus: { type: [Number], default: [] },
  },
  { _id: false }
);

const eventBlockSchema = new Schema(
  {
    eyebrow: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    copy: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    imageAlt: { type: String, trim: true, default: "" },
    ctaLabel: { type: String, trim: true, default: "" },
    ctaHref: { type: String, trim: true, default: "" },
    alignment: { type: String, enum: alignmentOptions, default: "left" },
  },
  { _id: false }
);

const editorialSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    title: { type: String, required: true, trim: true },
    label: { type: String, trim: true, default: "" },
    subtitle: { type: String, trim: true, default: "" },
    format: { type: String, required: true, enum: formatOptions },
    status: { type: String, required: true, enum: statusOptions, default: "draft" },
    /** 홈·관리자 목록 노출 순서 (오름차순, 0부터) */
    homeOrder: { type: Number, default: 0 },
    heroImage: { type: String, required: true, trim: true },
    heroImageAlt: { type: String, trim: true, default: "" },
    /** 히어로 배경 `background-position` (0–100%, cover 기준) */
    heroImagePosX: { type: Number, default: 50, min: 0, max: 100 },
    heroImagePosY: { type: Number, default: 50, min: 0, max: 100 },
    intro: { type: String, trim: true, default: "" },
    eventBlocks: {
      type: [eventBlockSchema],
      default: [],
      validate: {
        validator: (items) => Array.isArray(items) && items.length >= 1 && items.length <= 3,
        message: "eventBlocks는 1개 이상 3개 이하만 허용됩니다.",
      },
    },
    closingCtaLabel: { type: String, trim: true, default: "" },
    closingCtaHref: { type: String, trim: true, default: "" },
    relatedProductSkus: { type: [Number], default: [] },
    manifestoSections: { type: [sectionSchema], default: [] },
    looks: { type: [lookSchema], default: [] },
    processSections: { type: [sectionSchema], default: [] },
    galleryImages: { type: [imageBlockSchema], default: [] },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

module.exports = models.Editorial || model("Editorial", editorialSchema);
