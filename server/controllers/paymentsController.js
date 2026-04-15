const Order = require("../models/Order");

// 주문을 직렬화하여 클라이언트에 반환할 형태로 변환한다.
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

// 토스페이먼츠 결제 승인을 처리한다.
// POST /api/payments/confirm
// Body: { paymentKey, orderId, amount }
const confirmPayment = async (req, res) => {
  try {
    const { paymentKey, orderId, amount } = req.body;

    // 1. 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      return res.status(400).json({ message: "paymentKey, orderId, amount가 필요합니다." });
    }

    // 2. 주문 조회
    const order = await Order.findOne({ orderId }).lean();
    if (!order) {
      return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
    }

    // 3. 멱등성 체크 — 이미 처리된 결제라면 기존 데이터를 그대로 반환한다.
    if (order.status !== "pending") {
      return res.status(200).json({ message: "이미 처리된 결제입니다.", order: serializeOrder(order) });
    }

    // 4. 금액 검증 — 클라이언트 위변조 방지
    if (Math.round(order.totalPrice) !== Math.round(Number(amount))) {
      return res.status(400).json({ message: "결제 금액이 주문 금액과 일치하지 않습니다." });
    }

    // 5. 토스 결제 confirm API 호출
    const secretKey = process.env.TOSS_SECRET_KEY;
    const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    });

    if (!tossResponse.ok) {
      const tossError = await tossResponse.json();
      return res.status(400).json({
        message: tossError.message || "결제 승인에 실패했습니다.",
        code: tossError.code,
      });
    }

    // 6. 조건부 업데이트 — race condition 방지 (status: pending 조건으로 원자적 업데이트)
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId, status: "pending" },
      { status: "confirmed", tossPaymentKey: paymentKey, tossAmount: Number(amount) },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedOrder) {
      // 동시 요청에서 이미 다른 요청이 처리한 경우
      const existingOrder = await Order.findOne({ orderId }).lean();
      return res.status(200).json({ message: "이미 처리된 결제입니다.", order: serializeOrder(existingOrder) });
    }

    return res.status(200).json(serializeOrder(updatedOrder));
  } catch (error) {
    return res.status(500).json({ message: "결제 처리 중 오류가 발생했습니다.", error: error.message });
  }
};

module.exports = { confirmPayment };
