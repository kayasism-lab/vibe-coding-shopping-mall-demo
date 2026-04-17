import { describe, expect, it } from "vitest";
import { getRevenueChartBuckets } from "./reportChart";

const createOrder = (createdAt, totalPrice) => ({
  createdAt,
  totalPrice,
});

describe("getRevenueChartBuckets", () => {
  it("builds seven daily buckets for the 7d range", () => {
    const orders = [
      createOrder("2026-04-17T10:00:00.000Z", 12000),
      createOrder("2026-04-15T10:00:00.000Z", 8000),
    ];

    const buckets = getRevenueChartBuckets(orders, "7d", new Date("2026-04-17T12:00:00.000Z"));

    expect(buckets).toHaveLength(7);
    expect(buckets.at(-1)?.revenue).toBe(12000);
    expect(buckets.at(-3)?.revenue).toBe(8000);
  });

  it("builds thirty daily buckets for the 30d range and fills empty days with zero", () => {
    const orders = [createOrder("2026-04-17T10:00:00.000Z", 20000)];

    const buckets = getRevenueChartBuckets(orders, "30d", new Date("2026-04-17T12:00:00.000Z"));

    expect(buckets).toHaveLength(30);
    expect(buckets.filter((bucket) => bucket.revenue === 0)).toHaveLength(29);
    expect(buckets.at(-1)?.revenue).toBe(20000);
  });

  it("uses weekly and monthly bucket counts for longer ranges", () => {
    const now = new Date("2026-04-17T12:00:00.000Z");
    const orders = [
      createOrder("2026-04-15T10:00:00.000Z", 7000),
      createOrder("2026-04-01T10:00:00.000Z", 15000),
    ];

    const weeklyBuckets = getRevenueChartBuckets(orders, "90d", now);
    const monthlyBuckets = getRevenueChartBuckets(orders, "1y", now);

    expect(weeklyBuckets).toHaveLength(13);
    expect(weeklyBuckets.at(-1)?.revenue).toBe(7000);
    expect(monthlyBuckets).toHaveLength(12);
    expect(monthlyBuckets.at(-1)?.revenue).toBe(22000);
  });
});
