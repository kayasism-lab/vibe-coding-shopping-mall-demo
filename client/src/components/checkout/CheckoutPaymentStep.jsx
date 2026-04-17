import { useState } from "react";
import { ORDERS_API_URL } from "../../utils/auth";
import { formatKrw } from "../../utils/currency";

// 결제 수단 목록 정의
const PAYMENT_METHODS = [
  { id: "card", label: "신용카드" },
  { id: "tosspay", label: "토스페이" },
];

/**
 * 결제 단계 컴포넌트
 * Props:
 *   shippingData  - 배송 정보 (name, address 등)
 *   user          - 로그인 사용자 정보
 *   totalAmount   - 결제 총액 (Number)
 *   orderName     - 주문명 (예: "상품명 외 2건")
 *   items         - 주문 상품 목록
 *   onBack        - 배송 정보 단계로 돌아가는 콜백
 *   addOrder      - OrderContext의 주문 생성 함수
 */
function CheckoutPaymentStep({ shippingData, user, totalAmount, orderName, items, onBack, addOrder }) {
  // 선택된 결제 수단 상태 (기본: 카드)
  const [selectedMethod, setSelectedMethod] = useState("card");
  // 결제 처리 중 상태
  const [isProcessing, setIsProcessing] = useState(false);
  // 결제 오류 메시지 상태
  const [submitError, setSubmitError] = useState("");

  /**
   * 결제 처리 핸들러
   * 1. 임시 주문(pending) 생성
   * 2. 토스페이먼츠 SDK 초기화 후 결제창 호출
   * 3. 오류 발생 시 pending 주문 취소
   */
  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setIsProcessing(true);

    let createdOrder = null;

    try {
      // 1단계: 서버에 임시 주문 생성 (status: "pending")
      createdOrder = await addOrder({
        items,
        totalPrice: totalAmount,
        paymentMethod: selectedMethod === "card" ? "신용카드" : "토스페이",
        shippingAddress: shippingData,
        userKey: user?._id || user?.email || null,
      });

      // 2단계: 토스페이먼츠 SDK 동적 로드
      const { loadTossPayments } = await import("@tosspayments/payment-sdk");
      const tossPayments = await loadTossPayments(import.meta.env.VITE_TOSS_CLIENT_KEY);

      // 3단계: 결제 수단에 따라 결제창 호출
      const paymentMethod = selectedMethod === "card" ? "카드" : "토스페이";

      await tossPayments.requestPayment(paymentMethod, {
        amount: totalAmount,
        orderId: createdOrder.id,
        orderName,
        customerName: shippingData.name,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (err) {
      // 토스 결제창 오류 또는 SDK 초기화 오류 발생 시 pending 주문 취소
      if (createdOrder?.id) {
        try {
          await fetch(`${ORDERS_API_URL}/${createdOrder.id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "cancelled" }),
          });
        } catch {
          // 주문 취소 실패는 무시 (서버에서 별도 처리)
        }
      }

      // 사용자가 결제창을 직접 닫은 경우는 에러 메시지 표시 생략
      if (err?.code !== "USER_CANCEL") {
        setSubmitError(err?.message || "결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePaymentSubmit}>
      {/* 섹션 헤더: 제목 + 배송정보 수정 버튼 */}
      <div className="checkout-page__section-header checkout-page__section-header--row">
        <div>
          <p>결제 수단</p>
          <h1>결제 수단을 선택해주세요</h1>
        </div>
        <button
          className="checkout-page__text-button"
          type="button"
          onClick={onBack}
        >
          배송정보 수정
        </button>
      </div>

      {/* 결제 수단 선택 */}
      <div className="checkout-page__payment-options">
        {PAYMENT_METHODS.map(({ id, label }) => (
          <label key={id} className="checkout-page__payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value={id}
              checked={selectedMethod === id}
              onChange={() => setSelectedMethod(id)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {/* 결제 버튼 */}
      <button
        className="checkout-page__primary-button"
        type="submit"
        disabled={isProcessing}
      >
        {isProcessing ? "결제 처리 중..." : `${formatKrw(totalAmount)} 결제하기`}
      </button>

      {/* 오류 메시지 표시 */}
      {submitError && (
        <p className="account-page__error">{submitError}</p>
      )}
    </form>
  );
}

export default CheckoutPaymentStep;
