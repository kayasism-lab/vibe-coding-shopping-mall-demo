import { parseKrwAmount } from "./currency";

export const SHIPPING_THRESHOLD = 50000;
export const BASE_SHIPPING_COST = 500;
export const TAX_RATE = 0;

export const getShippingCost = (subtotal) =>
  parseKrwAmount(subtotal) >= SHIPPING_THRESHOLD ? 0 : BASE_SHIPPING_COST;

export const getTaxAmount = (subtotal) => parseKrwAmount(subtotal) * TAX_RATE;

export const getCheckoutTotal = (subtotal) =>
  parseKrwAmount(subtotal) + getShippingCost(subtotal) + getTaxAmount(subtotal);
