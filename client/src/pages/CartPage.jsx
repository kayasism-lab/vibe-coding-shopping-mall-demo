import { Link, useNavigate } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useCart } from "../context/CartContext";
import { formatKrw } from "../utils/currency";
import "./CartPage.css";

/** 무료배송 기준 (원) */
const SHIPPING_THRESHOLD = 50000;

function CartPage({ user, onLogout }) {
  const navigate = useNavigate();
  const { items, removeItem, totalItems, totalPrice, updateQuantity } = useCart();
  const amountToFreeShipping = Math.max(0, SHIPPING_THRESHOLD - totalPrice);
  const shippingProgress = Math.min(100, (totalPrice / SHIPPING_THRESHOLD) * 100);

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="cart-page">
        <div className="cart-page__header">
          <p>장바구니</p>
          <h1>{totalItems}개의 상품이 담겨 있습니다</h1>
        </div>

        {items.length > 0 ? (
          <div className="cart-page__layout">
            <section>
              {amountToFreeShipping > 0 ? (
                <div className="cart-page__shipping">
                  <p>{formatKrw(amountToFreeShipping)} 만큼 더 담으면 무료배송입니다.</p>
                  <div className="cart-page__shipping-bar">
                    <span style={{ width: `${shippingProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="cart-page__shipping cart-page__shipping--done">
                  무료배송 조건을 달성했습니다.
                </div>
              )}

              <div className="cart-page__items">
                {items.map((item) => (
                  <article
                    className="cart-page__item"
                    key={`${item.product.sku}-${item.selectedColor}-${item.selectedSize}`}
                  >
                    <Link to={`/product/${item.product.sku}`}>
                      <img loading="lazy" src={item.product.image} alt={item.product.name} />
                    </Link>

                    <div className="cart-page__item-content">
                      <div className="cart-page__item-head">
                        <div>
                          <h3>{item.product.name}</h3>
                          <p>
                            {item.selectedColor} / {item.selectedSize}
                          </p>
                        </div>

                        <button
                          className="cart-page__remove"
                          type="button"
                          onClick={() =>
                            removeItem(item.product.sku, item.selectedColor, item.selectedSize)
                          }
                        >
                          삭제
                        </button>
                      </div>

                      <div className="cart-page__item-footer">
                        <div className="cart-qty">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.sku,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity - 1
                              )
                            }
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.product.sku,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity + 1
                              )
                            }
                          >
                            +
                          </button>
                        </div>

                        <strong>{formatKrw(Number(item.product.price) * item.quantity)}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="cart-page__summary">
              <h2>주문 요약</h2>
              <div className="cart-page__summary-line">
                <span>상품 합계</span>
                <strong>{formatKrw(totalPrice)}</strong>
              </div>
              <div className="cart-page__summary-line">
                <span>배송비</span>
                <strong>{amountToFreeShipping > 0 ? "결제 시 계산" : "무료"}</strong>
              </div>
              <div className="cart-page__summary-line">
                <span>세금</span>
                <strong>결제 시 계산</strong>
              </div>
              <div className="cart-page__summary-total">
                <span>예상 결제 금액</span>
                <strong>{formatKrw(totalPrice)}</strong>
              </div>

              <button
                className="cart-page__checkout"
                type="button"
                onClick={() => navigate("/checkout")}
              >
                결제하기
              </button>
              <Link className="cart-page__continue" to="/">
                쇼핑 계속하기
              </Link>
            </aside>
          </div>
        ) : (
          <section className="cart-page__empty">
            <h2>장바구니가 비어 있습니다</h2>
            <p>상품 상세 페이지에서 옵션을 선택하고 담으면 여기에서 한 번에 확인할 수 있습니다.</p>
            <Link className="cart-page__continue" to="/">
              쇼핑 시작하기
            </Link>
          </section>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

export default CartPage;
