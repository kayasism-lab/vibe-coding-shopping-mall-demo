import { describe, expect, it } from "vitest";
import {
  BASE_SHIPPING_COST,
  getCheckoutTotal,
  getShippingCost,
  getTaxAmount,
  SHIPPING_THRESHOLD,
  TAX_RATE,
} from "./pricing";

describe("pricing utilities", () => {
  it("keeps the tax rate at zero for domestic checkout totals", () => {
    expect(TAX_RATE).toBe(0);
    expect(getTaxAmount(75000)).toBe(0);
  });

  it("charges the base shipping cost below the free-shipping threshold", () => {
    expect(getShippingCost(SHIPPING_THRESHOLD - 1)).toBe(BASE_SHIPPING_COST);
  });

  it("makes shipping free at the exact free-shipping threshold", () => {
    expect(getShippingCost(SHIPPING_THRESHOLD)).toBe(0);
  });

  it("returns the subtotal plus shipping only for checkout totals", () => {
    expect(getCheckoutTotal(20000)).toBe(20500);
    expect(getCheckoutTotal(60000)).toBe(60000);
  });

  it("parses formatted string subtotals safely", () => {
    expect(getShippingCost("20,000")).toBe(BASE_SHIPPING_COST);
    expect(getCheckoutTotal("20,000")).toBe(20500);
  });
});
