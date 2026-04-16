import { describe, expect, it } from "vitest";
import { products } from "../data/catalog";
import { localizeProduct } from "./productCatalog";
import { searchProducts } from "./productSearch";

const localizedProducts = products.map((product) => localizeProduct(product));

describe("searchProducts", () => {
  it("searches category, category2, name, description, and details together", () => {
    const results = searchProducts(localizedProducts, "우먼, 울");

    expect(results.map((product) => product.sku)).toContain(1);
  });

  it("matches localized category aliases", () => {
    const results = searchProducts(localizedProducts, "아우터");

    expect(results.some((product) => product.category === "Outerwear")).toBe(true);
  });

  it("matches product detail content", () => {
    const results = searchProducts(localizedProducts, "자개 버튼");

    expect(results.map((product) => product.sku)).toContain(3);
  });
});
