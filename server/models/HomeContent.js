const mongoose = require("mongoose");

const { Schema, model, models } = mongoose;

const heroSlideSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    image: { type: String, trim: true, default: "" },
    imagePosX: { type: Number, default: 50, min: 0, max: 100 },
    imagePosY: { type: Number, default: 50, min: 0, max: 100 },
    subtitle: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    ctaLabel: { type: String, trim: true, default: "신상품 보기" },
    ctaHref: { type: String, trim: true, default: "#products" },
  },
  { _id: false }
);

const moodCategorySchema = new Schema(
  {
    title: { type: String, trim: true, default: "" },
    slug: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const homeContentSchema = new Schema(
  {
    documentKey: { type: String, unique: true, default: "home" },
    moodEyebrow: { type: String, trim: true, default: "Collection" },
    moodTitle: { type: String, trim: true, default: "Shop by Mood" },
    heroSlides: { type: [heroSlideSchema], default: [] },
    moodCategories: { type: [moodCategorySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = models.HomeContent || model("HomeContent", homeContentSchema);
