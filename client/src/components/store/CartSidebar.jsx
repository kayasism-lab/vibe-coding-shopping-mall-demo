import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import ProductImageWithHover from "./ProductImageWithHover";
import { formatKrw } from "../../utils/currency";
import "./store.css";

function CartSidebar() {
  const navigate = useNavigate();
  const {
    isCartOpen,
    items,
    removeItem,
    setIsCartOpen,
    totalItems,
    totalPrice,
    updateQuantity,
  } = useCart();

  if (!isCartOpen) {
    return null;
  }

  return (
    <>
      <button
        aria-label="장바구니 닫기"
        className="cart-sidebar__backdrop"
        type="button"
        onClick={() => setIsCartOpen(false)}
      />

      <aside className="cart-sidebar">
        <div className="cart-sidebar__header">
          <div className="cart-sidebar__title-row">
            <strong>장바구니</strong>
            <span>{totalItems}개 상품</span>
          </div>
        </div>

        <div className="cart-sidebar__content">
          {items.length === 0 ? (
            <div className="cart-sidebar__empty">
              장바구니가 비어 있습니다.
              <br />
              상품 상세 페이지에서 옵션을 선택한 뒤 담아보세요.
            </div>
          ) : (
            items.map((item) => (
              <article
                className="cart-sidebar__item product-hover-card"
                key={`${item.product.sku}-${item.selectedColor}-${item.selectedSize}`}
              >
                <ProductImageWithHover
                  alt={item.product.name}
                  hoverImage={item.product.hoverImage}
                  image={item.product.image}
                />

                <div>
                  <h4>{item.product.name}</h4>
                  <p>
                    {item.selectedColor} / {item.selectedSize}
                  </p>
                  <p>{formatKrw(item.product.price)}</p>

                  <div className="cart-sidebar__item-footer">
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

                    <button
                      className="cart-sidebar__remove"
                      type="button"
                      onClick={() =>
                        removeItem(item.product.sku, item.selectedColor, item.selectedSize)
                      }
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {items.length > 0 ? (
          <div className="cart-sidebar__footer">
            <div className="cart-sidebar__summary">
              <span>합계</span>
              <strong>{formatKrw(totalPrice)}</strong>
            </div>

            <button
              className="cart-sidebar__summary-button"
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                navigate("/cart");
              }}
            >
              장바구니 보기
            </button>

            <button
              className="cart-sidebar__continue-button"
              type="button"
              onClick={() => setIsCartOpen(false)}
            >
              계속 쇼핑하기
            </button>
          </div>
        ) : null}
      </aside>
    </>
  );
}

export default CartSidebar;
