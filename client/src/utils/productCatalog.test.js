import { describe, expect, it } from "vitest";
import { categories, products } from "../data/catalog";
import {
  getCategoryHeroImage,
  getProductsByCategorySlug,
  getRelatedProducts,
  localizeProduct,
  matchesProductCategory,
} from "./productCatalog";

describe("productCatalog utilities", () => {
  it("localizes catalog copy to Korean", () => {
    const localizedProduct = localizeProduct(products[0]);

    expect(localizedProduct.name).toBe("오버사이즈 울 코트");
    expect(localizedProduct.details).toContain("이탈리아 울 100%");
    expect(localizedProduct.homeBadge).toBe("에디터 추천");
  });

  it("matches both category and category2 values", () => {
    expect(matchesProductCategory(products[0], "Women")).toBe(true);
    expect(matchesProductCategory(products[3], "Accessories")).toBe(true);
    expect(matchesProductCategory(products[0], "Accessories")).toBe(false);
  });

  it("returns accessories products for the accessories slug", () => {
    const accessoryProducts = getProductsByCategorySlug(products, "accessories");

    expect(accessoryProducts.map((product) => product.sku)).toEqual([4, 8]);
  });

  it("uses the category slug to resolve hero images", () => {
    expect(getCategoryHeroImage(categories, "new")).toBe(categories[3].image);
  });

  it("returns related products from the same women or men collection first", () => {
    const relatedProducts = getRelatedProducts(products, products[0]);

    expect(relatedProducts.map((product) => product.sku)).toEqual([3, 5, 7]);
    expect(relatedProducts.some((product) => product.sku === 6)).toBe(false);
  });
});
