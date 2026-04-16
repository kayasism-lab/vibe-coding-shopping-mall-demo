import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { products } from "../data/catalog";
import { localizeProduct } from "../utils/productCatalog";
import { ProductPageContent } from "./ProductPage";

vi.mock("../components/store/CartSidebar", () => ({
  default: () => <div>cart sidebar</div>,
}));

vi.mock("../components/store/StoreFooter", () => ({
  default: () => <div>store footer</div>,
}));

vi.mock("../components/store/StoreHeader", () => ({
  default: () => <div>store header</div>,
}));

vi.mock("../context/CartContext", () => ({
  useCart: () => ({
    addItem: vi.fn(),
    setIsCartOpen: vi.fn(),
  }),
}));

vi.mock("../context/WishlistContext", () => ({
  useWishlist: () => ({
    isInWishlist: () => false,
    toggleItem: vi.fn(),
  }),
}));

describe("ProductPageContent", () => {
  it("shows a clear add-to-cart message until a size is selected", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ProductPageContent
          product={localizeProduct(products[0])}
          relatedProducts={[]}
          user={null}
          onLogout={vi.fn()}
        />
      </MemoryRouter>
    );

    const addToCartButton = screen.getByRole("button", { name: "사이즈를 선택해주세요" });

    expect(addToCartButton).toBeDisabled();
    expect(screen.getByText("사이즈를 선택하면 장바구니에 담을 수 있습니다.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "XS" }));

    expect(addToCartButton).toBeEnabled();
    expect(addToCartButton).toHaveTextContent("장바구니 담기");
  });
});
