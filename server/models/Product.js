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
