const mongoose = require("mongoose");

const { Schema, model, models } = mongoose;

const orderItemSchema = new Schema(
  {
    productId: {
      type: Number,
      required: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    productCategory: {
      type: String,
      required: true,
      trim: true,
    },
    productImage: {
      type: String,
      required: true,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    selectedColor: {
      type: String,
      required: true,
      trim: true,
    },
    selectedSize: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addressLabel: {
      type: String,
      trim: true,
      default: "기본 배송지",
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userKey: {
      type: String,
      default: null,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    trackingNumber: {
      type: String,
      trim: true,
      default: "",
    },
    tossPaymentKey: {
      type: String,
      default: null,
      index: true,
    },
    tossAmount: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = models.Order || model("Order", orderSchema);
