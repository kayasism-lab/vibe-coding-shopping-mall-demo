const mongoose = require("mongoose");

const { Schema, model, models } = mongoose;
const categoryOptions = ["Outerwear", "Tops", "Bottoms", "Dresses", "Knitwear", "Accessories"];
const category2Options = ["Men", "Women", "Accessories"];

const colorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    hex: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

/** 상품 상세 — 기본 상세(불릿)와 추천 셀렉션 사이에 표시 (px 여백) */
const productDescriptionImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    marginTop: { type: Number, default: 0, min: 0, max: 400 },
    marginRight: { type: Number, default: 0, min: 0, max: 400 },
    marginBottom: { type: Number, default: 0, min: 0, max: 400 },
    marginLeft: { type: Number, default: 0, min: 0, max: 400 },
    caption: { type: String, default: "", trim: true, maxlength: 500 },
    captionPosition: { type: String, enum: ["top", "center", "bottom"], default: "bottom" },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    sku: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      min: 1,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    details: {
      type: [String],
      default: [],
    },
    descriptionImages: {
      type: [productDescriptionImageSchema],
      default: [],
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    hoverImage: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    colors: {
      type: [colorSchema],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: categoryOptions,
    },
    category2: {
      type: String,
      required: true,
      trim: true,
      enum: category2Options,
    },
    mainSelectionOrder: {
      type: Number,
      default: null,
      min: 1,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

module.exports = models.Product || model("Product", productSchema);
