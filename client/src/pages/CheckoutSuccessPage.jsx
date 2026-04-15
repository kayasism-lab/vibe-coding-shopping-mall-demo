import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useCart } from "../context/CartContext";
import { PAYMENTS_API_URL } from "../utils/auth";
import "./CheckoutPage.css";

const getJsonIfPossible = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : null;
};

/**
 * 토스페이먼츠 결제 성공 후 리다이렉트되는 페이지.
 * URL: /checkout/success?paymentKey=...&orderId=...&amount=...
 *
 * Props:
 *   user     - 로그인 사용자 정보
 *   onLogout - 로그아웃 콜백
 */
function CheckoutSuccessPage({ user, onLogout }) {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  // 토스 콜백 파라미터
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  // 결제 승인 상태: idle | loading | success | error
  const [status, setStatus] = useState(paymentKey ? "loading" : "idle");
  const [confirmedOrderId, setConfirmedOrderId] = useState(orderId || "");
  const [errorMessage, setErrorMessage] = useState("");

  // 중복 confirm 방지 — StrictMode 이중 호출 대응
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) return;
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    // 백엔드에 결제 승인 요청
    fetch(`${PAYMENTS_API_URL}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })
      .then(async (res) => {
        const data = await getJsonIfPossible(res);

        if (!res.ok) {
          throw new Error(data?.message || "결제 승인 요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }

        return data;
      })
      .then((data) => {
        // 일반 성공: { id, _id, ... } / 멱등성 응답: { message, order: { id, _id, ... } }
        const orderData = data.id ? data : data.order;
        if (!orderData?.id) {
          throw new Error(data.message || "결제 승인에 실패했습니다.");
        }
        clearCart();
        setConfirmedOrderId(orderData.id);
        setStatus("success");
      })
      .catch((err) => {
        setErrorMessage(err.message || "결제 승인에 실패했습니다.");
        setStatus("error");
      });
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // 결제 승인 실패 화면
  if (status === "error") {
    return (
      <div className="store-shell">
        <StoreHeader user={user} onLogout={onLogout} />
        <CartSidebar />
        <main className="checkout-success-page">
          <div className="checkout-success-page__card">
            <p>결제 오류</p>
            <h1>결제 승인에 실패했습니다.</h1>
            <span>{errorMessage}</span>
            <div className="checkout-success-page__actions">
              <Link className="checkout-page__primary-button checkout-success-page__link" to="/cart">
                장바구니로 돌아가기
              </Link>
            </div>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="checkout-success-page">
        <div className="checkout-success-page__card">
          {status === "loading" ? (
            <>
              <p>결제 확인 중</p>
              <h1>결제를 승인하고 있습니다...</h1>
            </>
          ) : (
            <>
              <p className="checkout-success-page__eyebrow checkout-success-page__eyebrow--celebration">
                <span aria-hidden="true">💐</span>
                <span>주문 완료</span>
              </p>
              <h1 className="checkout-success-page__title checkout-success-page__title--success">
                주문이 정상적으로 완료되었습니다.
              </h1>
              <span>
                {confirmedOrderId
                  ? `${confirmedOrderId} 주문이 접수되었습니다.`
                  : "주문 정보가 정상적으로 저장되었습니다."}
              </span>
            </>
          )}

          {status !== "loading" && (
            <div className="checkout-success-page__actions">
              <Link
                className="checkout-page__primary-button checkout-success-page__link"
                to="/"
              >
                계속 쇼핑하기
              </Link>
              {user && (
                <Link className="checkout-page__text-link" to="/account/orders">
                  주문내역 확인
                </Link>
              )}
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

export default CheckoutSuccessPage;
