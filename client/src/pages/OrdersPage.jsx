import { Link, Navigate } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import ProductImageWithHover from "../components/store/ProductImageWithHover";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useOrders } from "../context/OrderContext";
import { formatKrw } from "../utils/currency";
import "./AccountPage.css";

const statusLabels = {
  pending: "대기",
  confirmed: "확인",
  processing: "처리 중",
  shipped: "배송 중",
  delivered: "배송 완료",
  cancelled: "취소",
};

const getUserKey = (user) => user?._id || user?.email || null;

function OrdersPage({ user, onLogout }) {
  const { error, getUserOrders, isLoading } = useOrders();

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  const orders = getUserOrders(getUserKey(user));

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="account-page">
        <div className="account-page__heading">
          <p>내 주문</p>
          <h1>주문내역</h1>
        </div>

        {isLoading ? (
          <section className="account-page__panel account-page__panel--empty">
            <h2>주문내역을 불러오는 중입니다.</h2>
          </section>
        ) : orders.length > 0 ? (
          <div className="orders-page__list">
            {orders.map((order) => (
              <article className="orders-page__card" key={order.id}>
                <div className="orders-page__card-header">
                  <div>
                    <strong>{order.id}</strong>
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="orders-page__status">
                    <strong>{statusLabels[order.status] || order.status}</strong>
                    <span>{formatKrw(order.totalPrice)}</span>
                  </div>
                </div>

                <div className="orders-page__shipping">
                  <p>배송지</p>
                  <strong>{order.shippingAddress.name}</strong>
                  <span>{order.shippingAddress.address}</span>
                  <span>{order.shippingAddress.phone}</span>
                </div>

                <div className="orders-page__items">
                  {order.items.map((item) => (
                    <div
                      className="orders-page__item product-hover-card"
                      key={`${order.id}-${item.product.sku}-${item.selectedColor}-${item.selectedSize}`}
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
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="account-page__panel account-page__panel--empty">
            <h2>아직 주문 내역이 없습니다.</h2>
            <p className="account-page__muted">
              {error || "상품을 담고 체크아웃을 완료하면 여기에 기록됩니다."}
            </p>
            <Link className="account-page__primary-link" to="/">
              쇼핑하러 가기
            </Link>
          </section>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

export default OrdersPage;
