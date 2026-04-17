import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import ProductImageWithHover from "../components/store/ProductImageWithHover";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import CheckoutShippingStep from "../components/checkout/CheckoutShippingStep";
import CheckoutPaymentStep from "../components/checkout/CheckoutPaymentStep";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { formatKrw, parseKrwAmount } from "../utils/currency";
import { getCheckoutTotal, getShippingCost } from "../utils/pricing";
import "./CheckoutPage.css";

function CheckoutPage({ user, onLogout }) {
  const { addOrder } = useOrders();
  const { items, totalPrice } = useCart();
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.contact || "",
    addressLabel: "기본 배송지",
    address: "",
    deliveryNote: "",
  });

  const shippingCost = getShippingCost(totalPrice);
  const finalTotal = getCheckoutTotal(totalPrice);

  // 장바구니가 비어 있으면 장바구니 페이지로 이동
  if (items.length === 0) {
    return <Navigate replace to="/cart" />;
  }

  // 토스 결제창에 표시할 주문명 생성
  const orderName =
    items.length > 1
      ? `${items[0]?.product?.name || "주문"} 외 ${items.length - 1}건`
      : items[0]?.product?.name || "주문";

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="checkout-page">
        <Link className="checkout-page__back-link" to="/cart">
          장바구니로 돌아가기
        </Link>

        {/* 단계 진행 표시 바 */}
        <div className="checkout-page__progress">
          <div className={`checkout-page__step ${step >= 1 ? "is-active" : ""}`}>
            <span>{step > 1 ? "✓" : "1"}</span>
            <strong>배송</strong>
          </div>
          <div className="checkout-page__progress-line" />
          <div className={`checkout-page__step ${step >= 2 ? "is-active" : ""}`}>
            <span>2</span>
            <strong>결제</strong>
          </div>
        </div>

        <div className="checkout-page__layout">
          <section className="checkout-page__form">
            {step === 1 ? (
              <CheckoutShippingStep
                shippingData={shippingData}
                setShippingData={setShippingData}
                user={user}
                onSubmit={() => setStep(2)}
              />
            ) : (
              <CheckoutPaymentStep
                shippingData={shippingData}
                user={user}
                totalAmount={finalTotal}
                orderName={orderName}
                items={items}
                onBack={() => setStep(1)}
                addOrder={addOrder}
              />
            )}
          </section>

          {/* 주문 요약 사이드바 */}
          <aside className="checkout-page__summary">
            <h2>주문 요약</h2>
            <div className="checkout-page__summary-items">
              {items.map((item) => (
                <article
                  className="checkout-page__summary-item product-hover-card"
                  key={`${item.product.sku}-${item.selectedColor}-${item.selectedSize}`}
                >
                  <ProductImageWithHover
                    alt={item.product.name}
                    hoverImage={item.product.hoverImage}
                    image={item.product.image}
                  />
                  <div>
                    <strong>{item.product.name}</strong>
                    <span>
                      {item.selectedColor} / {item.selectedSize}
                    </span>
                    <span>수량: {item.quantity}</span>
                  </div>
                  <strong>{formatKrw(parseKrwAmount(item.product.price) * item.quantity)}</strong>
                </article>
              ))}
            </div>
            <div className="checkout-page__summary-line">
              <span>상품 합계</span>
              <strong>{formatKrw(totalPrice)}</strong>
            </div>
            <div className="checkout-page__summary-line">
              <span>배송비</span>
              <strong>{shippingCost === 0 ? "무료" : formatKrw(shippingCost)}</strong>
            </div>
            <div className="checkout-page__summary-total">
              <span>총 결제 금액</span>
              <strong>{formatKrw(finalTotal)}</strong>
            </div>
            {step === 1 ? (
              <button className="checkout-page__primary-button checkout-page__summary-button" form="checkout-shipping-form" type="submit">
                결제 단계로 이동
              </button>
            ) : null}
          </aside>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

export default CheckoutPage;
