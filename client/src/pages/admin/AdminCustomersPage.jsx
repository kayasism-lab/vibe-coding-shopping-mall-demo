import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../context/OrderContext";
import { formatKrw } from "../../utils/currency";
import { USERS_API_URL, getAuthorizationHeader } from "../../utils/auth";
import "./AdminPages.css";

const getUserOrderKey = (user) => user?._id || user?.email || null;

function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getAllOrders } = useOrders();
  const orders = getAllOrders();

  useEffect(() => {
    let ignore = false;

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const authorizationHeader = getAuthorizationHeader();
        const response = await fetch(USERS_API_URL, {
          headers: authorizationHeader ? { Authorization: authorizationHeader } : {},
        });
        const data = await response.json();

        if (!ignore && Array.isArray(data)) {
          setCustomers(data.filter((user) => user.userType !== "admin"));
        }
      } catch {
        if (!ignore) {
          setCustomers([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      ignore = true;
    };
  }, []);

  const customerRows = useMemo(
    () =>
      customers.map((customer) => {
        const customerOrders = orders.filter((order) => order.userKey === getUserOrderKey(customer));
        const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        const latestOrder = customerOrders
          .slice()
          .sort((firstOrder, secondOrder) => new Date(secondOrder.createdAt) - new Date(firstOrder.createdAt))[0];

        return {
          ...customer,
          totalOrders: customerOrders.length,
          totalSpent,
          lastOrderDate: latestOrder?.createdAt || null,
        };
      }),
    [customers, orders]
  );

  const filteredCustomers = useMemo(
    () =>
      customerRows.filter((customer) => {
        const keyword = searchQuery.toLowerCase();
        return (
          customer.name.toLowerCase().includes(keyword) ||
          customer.email.toLowerCase().includes(keyword)
        );
      }),
    [customerRows, searchQuery]
  );

  const totalRevenue = customerRows.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const avgOrderValue =
    customerRows.reduce((sum, customer) => sum + customer.totalOrders, 0) > 0
      ? totalRevenue / customerRows.reduce((sum, customer) => sum + customer.totalOrders, 0)
      : 0;

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">고객 관리</p>
          <h1 className="admin-page__title">고객</h1>
          <p className="admin-page__subtitle">
            회원 API와 주문 기록을 조합해 고객별 주문 수와 매출 기여도를 보여줍니다.
          </p>
        </div>
      </header>

      <div className="admin-page__summary-grid">
        <article className="admin-page__summary-card">
          <small>총 고객 수</small>
          <strong>{customerRows.length}</strong>
          <span>등록 회원 수</span>
        </article>
        <article className="admin-page__summary-card">
          <small>총 매출</small>
          <strong>{formatKrw(totalRevenue)}</strong>
          <span>고객 주문 합계</span>
        </article>
        <article className="admin-page__summary-card">
          <small>평균 주문 금액</small>
          <strong>{formatKrw(avgOrderValue)}</strong>
          <span>주문당 평균 결제액</span>
        </article>
      </div>

      <section className="admin-page__table-card">
        <div className="admin-page__controls">
          <input
            className="admin-page__search"
            placeholder="고객명 또는 이메일 검색"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="admin-page__empty">
            <h3>회원 정보를 불러오는 중입니다.</h3>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-page__table">
              <thead>
                <tr>
                  <th>고객</th>
                  <th>연락처</th>
                  <th>주문 수</th>
                  <th>총 구매금액</th>
                  <th>최근 주문</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id || customer.email}>
                    <td>
                      <div className="admin-page__customer-cell">
                        <div className="admin-page__thumb" style={{ width: "52px", height: "52px" }}>
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 700,
                            }}
                          >
                            {customer.name.slice(0, 1).toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <strong>{customer.name}</strong>
                          <small>{customer.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{customer.contact || "-"}</strong>
                      <small>{customer.addresses?.[0]?.address || "주소 정보 없음"}</small>
                    </td>
                    <td>{customer.totalOrders}</td>
                    <td>{formatKrw(customer.totalSpent)}</td>
                    <td>
                      {customer.lastOrderDate
                        ? new Date(customer.lastOrderDate).toLocaleDateString()
                        : "주문 없음"}
                    </td>
                    <td>
                      <div className="admin-page__actions">
                        <button
                          className="admin-page__icon-button"
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
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
            <h3>회원 정보가 없습니다.</h3>
            <p className="admin-page__muted">
              서버가 실행 중인지 확인하거나 새 회원가입을 진행한 뒤 다시 확인해주세요.
            </p>
          </div>
        )}
      </section>

      {selectedCustomer ? (
        <div className="admin-modal">
          <button
            aria-label="회원 상세 닫기"
            className="admin-modal__backdrop"
            type="button"
            onClick={() => setSelectedCustomer(null)}
          />
          <div className="admin-modal__dialog">
            <div className="admin-modal__header">
              <div>
                <h2>{selectedCustomer.name}</h2>
                <p className="admin-page__muted">고객 상세 정보</p>
              </div>
              <button className="admin-modal__close" type="button" onClick={() => setSelectedCustomer(null)}>
                닫기
              </button>
            </div>

            <div className="admin-modal__grid">
              <div className="admin-modal__card">
                <small>이메일</small>
                <strong>{selectedCustomer.email}</strong>
                <span>{selectedCustomer.contact || "연락처 없음"}</span>
              </div>
              <div className="admin-modal__card">
                <small>기본 주소</small>
                <strong>{selectedCustomer.addresses?.[0]?.label || "주소 미등록"}</strong>
                <span>{selectedCustomer.addresses?.[0]?.address || "-"}</span>
              </div>
            </div>

            <div style={{ marginTop: "18px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Link className="admin-page__button--ghost" to="/admin/orders">
                주문 목록 보기
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminCustomersPage;
