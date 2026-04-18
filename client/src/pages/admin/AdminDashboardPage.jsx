import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../context/OrderContext";
import { useProducts } from "../../context/ProductContext";
import { formatKrw } from "../../utils/currency";
import { USERS_API_URL, getAuthorizationHeader } from "../../utils/auth";
import "./AdminPages.css";

function OrdersStatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M7 7h13l-1.2 9.2a2 2 0 0 1-2 1.8H10a2 2 0 0 1-2-1.7L6 4H3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="10.5" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ProductStatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M4.5 7.2 12 11.5l7.5-4.3M12 11.5V21"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CustomerStatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M15.5 19a4.5 4.5 0 0 0-9 0M11 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.5 18.5a3.8 3.8 0 0 0-3.6-3.7M15.8 7.2a2.8 2.8 0 1 1 0 5.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function RevenueStatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="m5 15 4-4 3 3 6-7M16 7h5v5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function QuickProductIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function QuickOrderIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M6 7h12M6 12h12M6 17h8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function QuickReportIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M5 19h14M8 16V9M12 16V5M16 16v-3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function QuickMainSlideIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function QuickMainCategoryIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function QuickCustomerIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M16 18a4 4 0 0 0-8 0M12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const quickActions = [
  {
    to: "/admin/products/new",
    label: "새 상품 등록",
    description: "신규 상품을 바로 추가합니다.",
    icon: <QuickProductIcon />,
  },
  {
    to: "/admin/main-slide",
    label: "메인 슬라이드",
    description: "상단 히어로 슬라이드 이미지와 문구를 수정합니다.",
    icon: <QuickMainSlideIcon />,
  },
  {
    to: "/admin/main-category",
    label: "메인 카테고리",
    description: "Shop by Mood 제목과 카드(이미지·링크)를 수정합니다.",
    icon: <QuickMainCategoryIcon />,
  },
  {
    to: "/admin/orders",
    label: "주문 관리",
    description: "주문 상태를 확인하고 처리합니다.",
    icon: <QuickOrderIcon />,
  },
  {
    to: "/admin/reports",
    label: "매출 분석",
    description: "매출 리포트와 성과 지표를 확인합니다.",
    icon: <QuickReportIcon />,
  },
  {
    to: "/admin/customers",
    label: "고객 관리",
    description: "고객 정보와 주문 기여도를 확인합니다.",
    icon: <QuickCustomerIcon />,
  },
];

const statusClassMap = {
  pending: "is-amber",
  confirmed: "is-blue",
  processing: "is-blue",
  shipped: "is-green",
  delivered: "is-green",
  cancelled: "is-red",
};

const statusLabels = {
  pending: "대기",
  confirmed: "확인",
  processing: "처리 중",
  shipped: "배송 중",
  delivered: "배송 완료",
  cancelled: "취소",
};

const isWithinMonth = (value, monthDate) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    date.getFullYear() === monthDate.getFullYear() &&
    date.getMonth() === monthDate.getMonth()
  );
};

const countMonthlyItems = (items, getDateValue, monthDate) =>
  items.filter((item) => isWithinMonth(getDateValue(item), monthDate)).length;

const sumMonthlyItems = (items, getDateValue, getAmountValue, monthDate) =>
  items.reduce((sum, item) => {
    if (!isWithinMonth(getDateValue(item), monthDate)) {
      return sum;
    }

    return sum + Number(getAmountValue(item) || 0);
  }, 0);

const formatChangeText = (currentValue, previousValue, suffix = "전월 대비") => {
  if (previousValue === 0) {
    if (currentValue === 0) {
      return { text: `0% ${suffix}`, tone: "neutral" };
    }

    return { text: `+100% ${suffix}`, tone: "positive" };
  }

  const change = ((currentValue - previousValue) / previousValue) * 100;
  const roundedChange = Math.round(change);

  if (roundedChange === 0) {
    return { text: `0% ${suffix}`, tone: "neutral" };
  }

  return {
    text: `${roundedChange > 0 ? "+" : ""}${roundedChange}% ${suffix}`,
    tone: roundedChange > 0 ? "positive" : "negative",
  };
};

function AdminDashboardPage() {
  const { getAllOrders } = useOrders();
  const { products } = useProducts();
  const [users, setUsers] = useState([]);
  const orders = getAllOrders();

  useEffect(() => {
    let ignore = false;

    const fetchUsers = async () => {
      try {
        const authorizationHeader = getAuthorizationHeader();
        const response = await fetch(USERS_API_URL, {
          headers: authorizationHeader ? { Authorization: authorizationHeader } : {},
        });
        const data = await response.json();

        if (!ignore && Array.isArray(data)) {
          setUsers(data);
        }
      } catch {
        if (!ignore) {
          setUsers([]);
        }
      }
    };

    fetchUsers();

    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const customers = users.filter((user) => user.userType === "customer");
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const pendingOrders = orders.filter((order) =>
      ["pending", "confirmed", "processing"].includes(order.status)
    ).length;
    const newProducts = products.filter((product) => product.isNew).length;
    const customerCount = customers.length;
    const currentMonthOrders = countMonthlyItems(orders, (order) => order.createdAt, now);
    const previousMonthOrders = countMonthlyItems(orders, (order) => order.createdAt, previousMonth);
    const currentMonthProducts = countMonthlyItems(products, (product) => product.createdAt, now);
    const previousMonthProducts = countMonthlyItems(products, (product) => product.createdAt, previousMonth);
    const currentMonthCustomers = countMonthlyItems(customers, (customer) => customer.createdAt, now);
    const previousMonthCustomers = countMonthlyItems(
      customers,
      (customer) => customer.createdAt,
      previousMonth
    );
    const currentMonthRevenue = sumMonthlyItems(
      orders,
      (order) => order.createdAt,
      (order) => order.totalPrice,
      now
    );
    const previousMonthRevenue = sumMonthlyItems(
      orders,
      (order) => order.createdAt,
      (order) => order.totalPrice,
      previousMonth
    );
    const orderChange = formatChangeText(currentMonthOrders, previousMonthOrders);
    const productChange = formatChangeText(currentMonthProducts, previousMonthProducts);
    const customerChange = formatChangeText(currentMonthCustomers, previousMonthCustomers);
    const revenueChange = formatChangeText(currentMonthRevenue, previousMonthRevenue);

    return [
      {
        label: "총 주문",
        value: orders.length.toLocaleString("ko-KR"),
        detail: orderChange.text,
        detailTone: orderChange.tone,
        note: pendingOrders > 0 ? `${pendingOrders}건 처리 필요` : "처리 대기 주문 없음",
        tone: "blue",
        icon: <OrdersStatIcon />,
      },
      {
        label: "총 상품",
        value: products.length.toLocaleString("ko-KR"),
        detail: productChange.text,
        detailTone: productChange.tone,
        note: newProducts > 0 ? `신규 상품 ${newProducts}개` : "등록 상품 운영 중",
        tone: "green",
        icon: <ProductStatIcon />,
      },
      {
        label: "총 고객",
        value: customerCount.toLocaleString("ko-KR"),
        detail: customerChange.text,
        detailTone: customerChange.tone,
        note: customerCount > 0 ? "가입 고객 기준" : "등록 고객 없음",
        tone: "purple",
        icon: <CustomerStatIcon />,
      },
      {
        label: "총 매출",
        value: formatKrw(totalRevenue),
        detail: revenueChange.text,
        detailTone: revenueChange.tone,
        note: totalRevenue > 0 ? "누적 주문 매출" : "아직 발생한 매출 없음",
        tone: "orange",
        icon: <RevenueStatIcon />,
      },
    ];
  }, [orders, products, users]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
        .slice(0, 4),
    [orders]
  );

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">개요</p>
          <h1 className="admin-page__title">관리자 대시보드</h1>
        </div>
        <Link className="admin-page__button" to="/admin/orders">
          전체 주문 보기
        </Link>
      </header>

      <div className="admin-page__stats-grid">
        {stats.map((stat) => (
          <article className={`admin-page__stat-card admin-page__stat-card--${stat.tone}`} key={stat.label}>
            <div className="admin-page__stat-top">
              <div>
                <small>{stat.label}</small>
                <strong>{stat.value}</strong>
              </div>
              <span className="admin-page__stat-icon">{stat.icon}</span>
            </div>
            <span className={`admin-page__stat-detail admin-page__stat-detail--${stat.detailTone}`}>
              {stat.detail}
            </span>
            <small className="admin-page__stat-note">{stat.note}</small>
          </article>
        ))}
      </div>

      <div className="admin-page__dashboard-grid">
        <section className="admin-page__panel">
          <div className="admin-page__section-header admin-page__section-header--plain">
            <h2>빠른 작업</h2>
          </div>
          <div className="admin-page__panel-body">
            <div className="admin-page__quick-actions">
              {quickActions.map((action) => (
                <Link className="admin-page__quick-action" key={action.to} to={action.to}>
                  <div className="admin-page__quick-action-copy">
                    <div className="admin-page__quick-action-label">
                      <span className="admin-page__quick-action-icon">{action.icon}</span>
                      <strong>{action.label}</strong>
                    </div>
                    <small>{action.description}</small>
                  </div>
                  <span className="admin-page__quick-action-arrow">+</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-page__panel">
          <div className="admin-page__section-header admin-page__section-header--plain">
            <h2>최근 주문</h2>
            <Link to="/admin/orders">전체보기</Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="admin-page__list admin-page__recent-orders-list">
              {recentOrders.map((order) => (
                <div className="admin-page__list-row admin-page__list-row--order" key={order.id}>
                  <div>
                    <strong>{order.id}</strong>
                    <small>{order.shippingAddress?.name || "고객 정보 없음"}</small>
                    <small>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("ko-KR")
                        : "주문 일자 없음"}
                    </small>
                  </div>
                  <div className="admin-page__order-summary">
                    <span
                      className={`admin-page__status-pill ${
                        statusClassMap[order.status] || "is-blue"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                    <strong>{formatKrw(order.totalPrice)}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-page__empty admin-page__recent-orders-empty">
              <h3>최근 주문이 없습니다.</h3>
              <p className="admin-page__muted">체크아웃이 완료되면 최신 주문이 여기에 나타납니다.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
