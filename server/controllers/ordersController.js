const mongoose = require("mongoose");

const Order = require("../models/Order");

const orderFields = ["items", "totalPrice", "status", "paymentMethod", "shippingAddress"];
const statusOptions = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const pickFields = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }

    return result;
  }, {});

const normalizeOrderItems = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          productId: Number(
            item?.product?.sku ?? item?.product?.id ?? item?.productId
          ),
          productName: String(item?.product?.name || item?.productName || "").trim(),
          productCategory: String(item?.product?.category || item?.productCategory || "").trim(),
          productImage: String(item?.product?.image || item?.productImage || "").trim(),
          unitPrice: Number(item?.product?.price || item?.unitPrice || 0),
          quantity: Number(item?.quantity || 1),
          selectedColor: String(item?.selectedColor || "").trim(),
          selectedSize: String(item?.selectedSize || "").trim(),
        }))
        .filter((item) => item.productId && item.productName && item.productImage)
    : [];

const normalizeShippingAddress = (shippingAddress = {}) => ({
  name: String(shippingAddress.name || "").trim(),
  email: String(shippingAddress.email || "").trim(),
  phone: String(shippingAddress.phone || "").trim(),
  addressLabel: String(shippingAddress.addressLabel || "기본 배송지").trim(),
  address: String(shippingAddress.address || "").trim(),
  deliveryNote: String(shippingAddress.deliveryNote || "").trim(),
});

const normalizeOrder = (payload) => ({
  ...payload,
  items: normalizeOrderItems(payload.items),
  totalPrice: Number(payload.totalPrice || 0),
  status: String(payload.status || "pending").trim(),
  paymentMethod: String(payload.paymentMethod || "").trim(),
  shippingAddress: normalizeShippingAddress(payload.shippingAddress),
});

const validateOrderPayload = (payload) => {
  if (payload.items.length === 0) {
    return "주문 상품이 없습니다.";
  }

  if (!payload.paymentMethod) {
    return "결제 수단을 입력해주세요.";
  }

  if (!payload.shippingAddress.name || !payload.shippingAddress.phone || !payload.shippingAddress.address) {
    return "배송지 정보를 모두 입력해주세요.";
  }

  if (!Number.isFinite(payload.totalPrice) || payload.totalPrice <= 0) {
    return "올바른 주문 금액이 필요합니다.";
  }

  if (!statusOptions.includes(payload.status)) {
    return "유효하지 않은 주문 상태입니다.";
  }

  return "";
};

const serializeOrder = (order) => ({
  id: order.orderId,
  _id: order._id,
  items: order.items.map((item) => ({
    product: {
      sku: item.productId,
      name: item.productName,
      category: item.productCategory,
      image: item.productImage,
      price: item.unitPrice.toFixed(2),
    },
    quantity: item.quantity,
    selectedColor: item.selectedColor,
    selectedSize: item.selectedSize,
  })),
  totalPrice: order.totalPrice,
  status: order.status,
  paymentMethod: order.paymentMethod,
  shippingAddress: order.shippingAddress,
  trackingNumber: order.trackingNumber || undefined,
  tossPaymentKey: order.tossPaymentKey || undefined,
  tossAmount: order.tossAmount || undefined,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  userKey: order.userKey,
  userId: order.userId,
});

const buildNextOrderId = async () => {
  const latestOrder = await Order.findOne().sort({ createdAt: -1 }).lean();
  const latestNumericId = latestOrder?.orderId?.match(/(\d+)$/)?.[1];
  const nextSequence = latestNumericId ? Number(latestNumericId) + 1 : 1;
  return `ORD-${String(nextSequence).padStart(6, "0")}`;
};

const getOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders.map(serializeOrder));
  } catch (error) {
    res.status(500).json({ message: "주문 목록 조회에 실패했습니다.", error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "로그인한 사용자 정보가 없습니다." });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json(orders.map(serializeOrder));
  } catch (error) {
    return res.status(500).json({ message: "내 주문 조회에 실패했습니다.", error: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const payload = normalizeOrder(pickFields(req.body, orderFields));
    const validationMessage = validateOrderPayload(payload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const orderId = await buildNextOrderId();
    const authenticatedUserId = req.user?.userId;
    const normalizedUserId =
      authenticatedUserId && mongoose.Types.ObjectId.isValid(authenticatedUserId)
        ? authenticatedUserId
        : null;

    const createdOrder = await Order.create({
      ...payload,
      orderId,
      status: "pending", // 클라이언트 제공 status 무시 — 항상 pending으로 강제 (SPEC-CHECKOUT-001 R5)
      userId: normalizedUserId,
      userKey: normalizedUserId ? String(normalizedUserId) : req.body.userKey || null,
    });

    return res.status(201).json(serializeOrder(createdOrder.toObject()));
  } catch (error) {
    return res.status(400).json({ message: "주문 생성에 실패했습니다.", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const nextStatus = String(req.body.status || "").trim();

    if (!statusOptions.includes(nextStatus)) {
      return res.status(400).json({ message: "유효하지 않은 주문 상태입니다." });
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      {
        status: nextStatus,
        trackingNumber: req.body.trackingNumber !== undefined ? String(req.body.trackingNumber || "").trim() : undefined,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updatedOrder) {
      return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
    }

    return res.json(serializeOrder(updatedOrder));
  } catch (error) {
    return res.status(400).json({ message: "주문 상태 수정에 실패했습니다.", error: error.message });
  }
};

module.exports = {
  getOrders,
  getMyOrders,
  createOrder,
  updateOrderStatus,
};
