import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useOrders } from "../../context/OrderContext";
import { useProducts } from "../../context/ProductContext";
import { formatKrw, formatKrwCompact } from "../../utils/currency";
import "./AdminPages.css";

function AdminReportDetailPage() {
  const { id } = useParams();
  const { getProductById } = useProducts();
  const { getAllOrders } = useOrders();
  const product = getProductById(id);
  const orders = getAllOrders();

  const monthlySales = useMemo(
    () => {
      if (!product) {
        return [];
      }

      const formatter = new Intl.DateTimeFormat("en-US", { month: "short" });
      const groupedSales = new Map();

      orders.forEach((order) => {
        order.items
          .filter((item) => item.product.sku === product.sku)
          .forEach((item) => {
            const month = formatter.format(new Date(order.createdAt));
            const currentMonth = groupedSales.get(month) || { month, units: 0, revenue: 0 };
            currentMonth.units += item.quantity;
            currentMonth.revenue += item.quantity * Number.parseFloat(item.product.price);
            groupedSales.set(month, currentMonth);
          });
      });

      return [...groupedSales.values()];
    },
    [orders, product]
  );

  if (!product) {
    return <Navigate replace to="/not-found" />;
  }

  const relatedItems = orders.flatMap((order) =>
    order.items.filter((item) => item.product.sku === product.sku)
  );
  const totalUnitsSold = relatedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalRevenue = relatedItems.reduce(
    (sum, item) => sum + item.quantity * Number.parseFloat(item.product.price),
    0
  );
  const averageOrderValue = totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : 0;

  const colorPerformance = product.colors.map((color) => {
    const units = relatedItems
      .filter((item) => item.selectedColor === color.name)
      .reduce((sum, item) => sum + item.quantity, 0);
    return {
      ...color,
      units,
      percentage: totalUnitsSold > 0 ? Math.round((units / totalUnitsSold) * 100) : 0,
    };
  });

  const sizePerformance = product.sizes.map((size) => {
    const units = relatedItems
      .filter((item) => item.selectedSize === size)
      .reduce((sum, item) => sum + item.quantity, 0);
    return {
      size,
      units,
      percentage: totalUnitsSold > 0 ? Math.round((units / totalUnitsSold) * 100) : 0,
    };
  });

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <div className="admin-page__breadcrumbs">
            <Link to="/admin/reports">리포트</Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>
          <h1 className="admin-page__title">{product.name}</h1>
          <p className="admin-page__subtitle">
            개별 상품 단위의 성과 지표를 참조 디자인 구조에 맞춰 제공합니다.
          </p>
        </div>
        <Link className="admin-page__button--ghost" to="/admin/reports">
          리포트 목록
        </Link>
      </header>

      <div className="admin-page__summary-grid">
        <article className="admin-page__summary-card">
          <small>판매가</small>
          <strong>{formatKrw(product.price)}</strong>
          <span>현재 판매가</span>
        </article>
        <article className="admin-page__summary-card">
          <small>판매 수량</small>
          <strong>{totalUnitsSold}</strong>
          <span>누적 판매수</span>
        </article>
        <article className="admin-page__summary-card">
          <small>총 매출</small>
          <strong>{formatKrw(totalRevenue)}</strong>
          <span>실제 주문 기준</span>
        </article>
      </div>

      <section className="admin-page__chart-card">
        <div className="admin-page__section-header">
          <h2>월별 판매 성과</h2>
        </div>
        <div className="admin-page__chart-body">
          <div className="admin-page__chart">
              {(monthlySales.length > 0 ? monthlySales : [{ month: "데이터 없음", units: 0, revenue: 0 }]).map((item) => (
              <div className="admin-page__bar-group" key={item.month}>
                <span className="admin-page__bar-value">
                  {item.units > 0 ? formatKrwCompact(item.revenue) : "0원"}
                </span>
                  <div
                    className="admin-page__bar"
                    style={{ height: `${Math.max((item.revenue / 10000) * 180, 12)}px` }}
                  />
                <span className="admin-page__bar-label">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="admin-page__charts-grid">
        <section className="admin-page__chart-card">
          <div className="admin-page__section-header">
            <h2>색상별 성과</h2>
          </div>
          <div className="admin-page__chart-body">
            <div className="admin-page__metric-list">
              {colorPerformance.map((item) => (
                <div className="admin-page__metric-row" key={item.name}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "999px",
                        border: "1px solid rgba(17, 24, 39, 0.1)",
                        background: item.hex,
                      }}
                    />
                    <strong>{item.name}</strong>
                  </div>
                  <span>{item.units}개</span>
                  <span className="is-positive">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-page__chart-card">
          <div className="admin-page__section-header">
            <h2>사이즈별 성과</h2>
          </div>
          <div className="admin-page__chart-body">
            <div className="admin-page__metric-list">
              {sizePerformance.map((item) => (
                <div className="admin-page__metric-row" key={item.size}>
                  <strong>{item.size}</strong>
                  <span>{item.units}개</span>
                  <span className="is-positive">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="admin-page__panel">
        <div className="admin-page__section-header">
          <h2>추가 지표</h2>
        </div>
        <div className="admin-page__panel-body">
          <div className="admin-page__metric-list">
            <div className="admin-page__metric-row">
              <strong>개당 평균 매출</strong>
              <span>{formatKrw(averageOrderValue)}</span>
              <span className="is-positive">{relatedItems.length}개 주문 항목</span>
            </div>
            <div className="admin-page__metric-row">
              <strong>해당 상품 포함 주문 수</strong>
              <span>{orders.filter((order) => order.items.some((item) => item.product.sku === product.sku)).length}</span>
              <span className="is-positive">주문 수</span>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

export default AdminReportDetailPage;
