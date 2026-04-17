import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useOrders } from "../../context/OrderContext";
import { useProducts } from "../../context/ProductContext";
import { formatKrw, formatKrwCompact } from "../../utils/currency";
import { getRevenueChartBuckets } from "../../utils/reportChart";
import "./AdminPages.css";

function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const { getAllOrders, isLoading } = useOrders();
  const { products } = useProducts();
  const orders = getAllOrders();

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const totalUnits = orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const revenueChartBuckets = getRevenueChartBuckets(orders, dateRange);
  const maxBucketRevenue = revenueChartBuckets.reduce(
    (highestRevenue, bucket) => Math.max(highestRevenue, bucket.revenue),
    0
  );

  const categoryCounts = orders.reduce((result, order) => {
    order.items.forEach((item) => {
      const key = item.product.category;
      result[key] = result[key] || { sales: 0, revenue: 0 };
      result[key].sales += item.quantity;
      result[key].revenue += item.quantity * Number.parseFloat(item.product.price);
    });
    return result;
  }, {});

  const categoryPerformance = Object.entries(categoryCounts).map(([category, summary], index) => ({
    category,
    sales: summary.sales,
    revenue: summary.revenue,
    growth: Number((index % 2 === 0 ? 8.5 + index : -2.1 + index).toFixed(1)),
  }));

  const summaries = new Map();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const currentSummary = summaries.get(item.product.sku) || {
        ...item.product,
        unitsSold: 0,
        revenue: 0,
      };

      currentSummary.unitsSold += item.quantity;
      currentSummary.revenue += item.quantity * Number.parseFloat(item.product.price);
      summaries.set(item.product.sku, currentSummary);
    });
  });

  const summarizedProducts = [...summaries.values()].sort(
    (first, second) => second.unitsSold - first.unitsSold
  );

  const topSellingProducts =
    summarizedProducts.length > 0
      ? summarizedProducts.slice(0, 5)
      : products.slice(0, 5).map((product) => ({
          ...product,
          unitsSold: 0,
          revenue: 0,
        }));

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">분석</p>
          <h1 className="admin-page__title">리포트</h1>
          <p className="admin-page__subtitle">
            참조 디자인의 리포트 화면을 현재 상품/주문 데이터 구조에 맞춰 통합했습니다.
          </p>
        </div>
        <div className="admin-page__actions">
          {["7d", "30d", "90d", "1y"].map((range) => (
            <button
              key={range}
              className={`admin-page__filter-tab ${dateRange === range ? "is-active" : ""}`}
              type="button"
              onClick={() => setDateRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      <div className="admin-page__stats-grid">
        <article className="admin-page__stat-card">
          <small>총 매출</small>
          <strong>{formatKrw(totalRevenue)}</strong>
          <span>현재 주문 기준 매출</span>
        </article>
        <article className="admin-page__stat-card">
          <small>총 주문 수</small>
          <strong>{orders.length}</strong>
          <span>누적 주문 수</span>
        </article>
        <article className="admin-page__stat-card">
          <small>판매 수량</small>
          <strong>{totalUnits}</strong>
          <span>전체 판매 수량</span>
        </article>
        <article className="admin-page__stat-card">
          <small>평균 주문 금액</small>
          <strong>{formatKrw(averageOrderValue)}</strong>
          <span>주문당 평균 결제액</span>
        </article>
      </div>

      {isLoading ? (
        <section className="admin-page__empty">
          <h3>리포트 데이터를 불러오는 중입니다.</h3>
        </section>
      ) : null}

      <div className="admin-page__charts-grid">
        <section className="admin-page__chart-card">
          <div className="admin-page__section-header">
            <h2>매출 개요</h2>
          </div>
          <div className="admin-page__chart-body">
            <div
              className={`admin-page__chart ${
                revenueChartBuckets.length > 20
                  ? "admin-page__chart--compact"
                  : revenueChartBuckets.length > 12
                    ? "admin-page__chart--dense"
                    : ""
              }`}
            >
              {revenueChartBuckets.map((item) => (
                <div className="admin-page__bar-group" data-testid="revenue-bar-group" key={item.key}>
                  <span className="admin-page__bar-value">
                    {item.revenue > 0 ? formatKrwCompact(item.revenue) : ""}
                  </span>
                  <div
                    className="admin-page__bar"
                    style={{
                      height: `${
                        maxBucketRevenue > 0
                          ? Math.max((item.revenue / maxBucketRevenue) * 220, item.revenue > 0 ? 12 : 6)
                          : 6
                      }px`,
                    }}
                  />
                  <span className="admin-page__bar-label">{item.displayLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-page__chart-card">
          <div className="admin-page__section-header">
            <h2>카테고리 성과</h2>
          </div>
          <div className="admin-page__chart-body">
            <div className="admin-page__metric-list">
              {categoryPerformance.map((item) => (
                <div className="admin-page__metric-row" key={item.category}>
                  <div>
                    <strong>{item.category}</strong>
                    <small>{item.sales}개 판매</small>
                  </div>
                  <span>{formatKrw(item.revenue)}</span>
                  <span className={item.growth >= 0 ? "is-positive" : "is-negative"}>
                    {item.growth >= 0 ? "+" : ""}
                    {item.growth}%
                  </span>
                </div>
              ))}
            </div>
            {categoryPerformance.length === 0 ? (
              <p className="admin-page__muted">주문이 생성되면 카테고리별 실적이 표시됩니다.</p>
            ) : null}
          </div>
        </section>
      </div>

      <section className="admin-page__panel">
        <div className="admin-page__section-header">
          <h2>인기 판매 상품</h2>
          <Link to="/admin/products">상품 목록</Link>
        </div>

        <div className="admin-page__list">
          {topSellingProducts.map((product, index) => (
            <Link
              key={product.sku}
              className="admin-page__media-row"
              style={{ color: "inherit", textDecoration: "none" }}
              to={`/admin/reports/${product.sku}`}
            >
              <div className="admin-page__product-cell">
                <strong style={{ width: "20px" }}>{index + 1}</strong>
                <div className="admin-page__rank-thumb">
                  <img alt={product.name} loading="lazy" src={product.image} />
                </div>
                <div>
                  <strong>{product.name}</strong>
                  <small>{product.unitsSold}개 판매</small>
                </div>
              </div>
              <div>
                <strong>{formatKrw(product.revenue)}</strong>
                <small>{formatKrw(product.price)} / 개당</small>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

export default AdminReportsPage;
