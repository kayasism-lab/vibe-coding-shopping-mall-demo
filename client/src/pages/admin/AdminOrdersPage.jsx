import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrders } from "../../context/OrderContext";
import { formatKrw } from "../../utils/currency";
import "./AdminPages.css";

const statusOrder = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const statusLabels = {
  all: "전체",
  pending: "대기",
  confirmed: "확인",
  processing: "처리 중",
  shipped: "배송 중",
  delivered: "배송 완료",
  cancelled: "취소",
};

const getStatusClassName = (status) => {
  if (status === "delivered") {
    return "is-green";
  }

  if (status === "shipped" || status === "confirmed") {
    return "is-blue";
  }

  if (status === "pending" || status === "processing") {
    return "is-amber";
  }

  return "is-red";
};

function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get("status") || "all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusError, setStatusError] = useState("");
  const { getAllOrders, isLoading, updateOrderStatus } = useOrders();
  const orders = getAllOrders();

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesSearch =
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.shippingAddress?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;

        return matchesSearch && matchesStatus;
      }),
    [orders, searchQuery, selectedStatus]
  );

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };

    orders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });

    return counts;
  }, [orders]);

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">주문 처리</p>
          <h1 className="admin-page__title">주문</h1>
          <p className="admin-page__subtitle">
            체크아웃으로 생성된 주문을 상태별로 확인하고 상세 정보를 팝업으로 볼 수 있습니다.
          </p>
        </div>
      </header>

      <section className="admin-page__table-card">
        <div className="admin-page__controls">
          <div className="admin-page__filter-tabs">
            {statusOrder.map((status) => (
              <button
                key={status}
                className={`admin-page__filter-tab ${selectedStatus === status ? "is-active" : ""}`}
                type="button"
                onClick={() => setSelectedStatus(status)}
              >
                {statusLabels[status] || status}
                {statusCounts[status] ? ` (${statusCounts[status]})` : ""}
              </button>
            ))}
          </div>

          <input
            className="admin-page__search"
            placeholder="주문번호 또는 고객명 검색"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="admin-page__empty">
            <h3>주문을 불러오는 중입니다.</h3>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-page__table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>고객</th>
                  <th>주문일</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>
                    <td>
                      <strong>{order.shippingAddress?.name || "고객 정보 없음"}</strong>
                      <small>{order.shippingAddress?.email || order.userKey || "-"}</small>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{formatKrw(order.totalPrice)}</td>
                    <td>
                      <span className={`admin-page__status-pill ${getStatusClassName(order.status)}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-page__actions">
                        <button
                          className="admin-page__icon-button"
                          type="button"
                          onClick={() => {
                            setStatusError("");
                            setSelectedOrder(order);
                          }}
                        >
                          상세
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-page__empty">
            <h3>표시할 주문이 없습니다.</h3>
            <p className="admin-page__muted">현재 필터 조건과 일치하는 주문이 없습니다.</p>
          </div>
        )}
      </section>

      {selectedOrder ? (
        <div className="admin-modal">
          <button
            aria-label="주문 상세 닫기"
            className="admin-modal__backdrop"
            type="button"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="admin-modal__dialog">
            <div className="admin-modal__header">
              <div>
                <h2>{selectedOrder.id}</h2>
                <p className="admin-page__muted">주문 상세 정보</p>
              </div>
              <button className="admin-modal__close" type="button" onClick={() => setSelectedOrder(null)}>
                닫기
              </button>
            </div>

            <div className="admin-modal__grid">
              <div className="admin-modal__card">
                <small>고객</small>
                <strong>{selectedOrder.shippingAddress?.name || "고객 정보 없음"}</strong>
                <span>{selectedOrder.shippingAddress?.phone || "-"}</span>
                <span>{selectedOrder.shippingAddress?.email || selectedOrder.userKey || "-"}</span>
              </div>
              <div className="admin-modal__card">
                <small>배송지</small>
                <strong>{selectedOrder.shippingAddress?.addressLabel || "배송지"}</strong>
                <span>{selectedOrder.shippingAddress?.address || "-"}</span>
                <span>{selectedOrder.shippingAddress?.deliveryNote || "요청사항 없음"}</span>
              </div>
            </div>

            <div style={{ marginTop: "18px" }}>
              <small className="admin-page__eyebrow" style={{ marginBottom: "10px", display: "block" }}>
                주문 상태
              </small>
              <select
                className="admin-page__status-select"
                value={selectedOrder.status}
                onChange={async (event) => {
                  try {
                    setStatusError("");
                    const updatedOrder = await updateOrderStatus(selectedOrder.id, event.target.value);
                    setSelectedOrder(updatedOrder);
                  } catch (error) {
                    setStatusError(error.message || "주문 상태 변경에 실패했습니다.");
                  }
                }}
              >
                {statusOrder.filter((status) => status !== "all").map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status] || status}
                  </option>
                ))}
              </select>
              {statusError ? <p className="admin-page__muted">{statusError}</p> : null}
            </div>

            <div className="admin-modal__order-items">
              {selectedOrder.items.map((item) => (
                <div
                  className="admin-modal__order-item"
                  key={`${selectedOrder.id}-${item.product.sku}-${item.selectedColor}-${item.selectedSize}`}
                >
                  <img alt={item.product.name} loading="lazy" src={item.product.image} />
                  <div>
                    <strong>{item.product.name}</strong>
                    <small>
                      {item.selectedColor} / {item.selectedSize} / 수량 {item.quantity}
                    </small>
                  </div>
                  <strong>{formatKrw(item.quantity * Number.parseFloat(item.product.price))}</strong>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "18px", textAlign: "right" }}>
              <strong>총액 {formatKrw(selectedOrder.totalPrice)}</strong>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminOrdersPage;
