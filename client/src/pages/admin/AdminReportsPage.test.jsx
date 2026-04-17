import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminReportsPage from "./AdminReportsPage";

const mockOrders = [];

vi.mock("../../context/OrderContext", () => ({
  useOrders: () => ({
    getAllOrders: () => mockOrders,
    isLoading: false,
  }),
}));

vi.mock("../../context/ProductContext", () => ({
  useProducts: () => ({
    products: [],
  }),
}));

describe("AdminReportsPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T12:00:00.000Z"));
    mockOrders.splice(
      0,
      mockOrders.length,
      {
        createdAt: "2026-04-17T10:00:00.000Z",
        totalPrice: 12000,
        items: [],
      },
      {
        createdAt: "2026-04-10T10:00:00.000Z",
        totalPrice: 8000,
        items: [],
      },
      {
        createdAt: "2026-03-20T10:00:00.000Z",
        totalPrice: 6000,
        items: [],
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the four active report summary cards without the conversion stat", () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>
    );

    expect(screen.getByText("총 매출")).toBeInTheDocument();
    expect(screen.getByText("총 주문 수")).toBeInTheDocument();
    expect(screen.getByText("판매 수량")).toBeInTheDocument();
    expect(screen.getByText("평균 주문 금액")).toBeInTheDocument();
    expect(screen.queryByText("전환율")).not.toBeInTheDocument();
  });

  it("changes the number of revenue buckets based on the selected date range", async () => {
    render(
      <MemoryRouter>
        <AdminReportsPage />
      </MemoryRouter>
    );

    expect(screen.getAllByTestId("revenue-bar-group")).toHaveLength(30);

    fireEvent.click(screen.getByRole("button", { name: "7d" }));
    expect(screen.getAllByTestId("revenue-bar-group")).toHaveLength(7);

    fireEvent.click(screen.getByRole("button", { name: "90d" }));
    expect(screen.getAllByTestId("revenue-bar-group")).toHaveLength(13);

    fireEvent.click(screen.getByRole("button", { name: "1y" }));
    expect(screen.getAllByTestId("revenue-bar-group")).toHaveLength(12);
  });
});
