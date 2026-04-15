import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { getAuthorizationHeader } from "../utils/auth";
import "./CheckoutPage.css";

/**
 * 토스페이먼츠 결제 실패/취소 후 리다이렉트되는 페이지.
 * URL: /checkout/fail?code=...&message=...&orderId=...
 *
 * Props:
 *   user     - 로그인 사용자 정보
 *   onLogout - 로그아웃 콜백
 */
function CheckoutFailPage({ user, onLogout }) {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") || "";
  const message = searchParams.get("message") || "결제가 취소되었습니다.";
  const orderId = searchParams.get("orderId") || "";

  // 중복 취소 방지 — StrictMode 이중 호출 대응
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!orderId || cancelledRef.current) return;
    cancelledRef.current = true;

    // 결제 실패/취소로 생성된 pending 주문을 cancelled 상태로 변경
    const authHeader = getAuthorizationHeader();
    fetch(`/api/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ status: "cancelled" }),
    }).catch(() => {
      // 주문 취소 실패는 사용자 플로우를 차단하지 않음
    });
  }, [orderId]);

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="checkout-success-page">
        <div className="checkout-success-page__card">
          <p>결제 실패</p>
          <h1>결제가 완료되지 않았습니다.</h1>
          <span>
            {message}
            {code && ` (코드: ${code})`}
          </span>

          <div className="checkout-success-page__actions">
            <Link
              className="checkout-page__primary-button checkout-success-page__link"
              to="/cart"
            >
              장바구니로 돌아가기
            </Link>
            <Link className="checkout-page__text-link" to="/">
              계속 쇼핑하기
            </Link>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

export default CheckoutFailPage;
