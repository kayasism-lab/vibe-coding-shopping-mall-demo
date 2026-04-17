import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const mockCreateEditorial = vi.fn();
const mockFetchAdminEditorials = vi.fn();
const mockUpdateEditorial = vi.fn();

vi.mock("../../context/EditorialContext", () => ({
  useEditorials: () => ({
    createEditorial: mockCreateEditorial,
    fetchAdminEditorials: mockFetchAdminEditorials,
    updateEditorial: mockUpdateEditorial,
  }),
}));

vi.mock("../../context/ProductContext", () => ({
  useProducts: () => ({ products: [] }),
}));

vi.mock("../../utils/cloudinaryWidget", () => ({
  getCloudinaryEnv: () => ({ ready: false }),
  openCloudinaryUploadWidget: vi.fn(),
}));

import AdminEditorialFormPage from "./AdminEditorialFormPage";

describe("AdminEditorialFormPage", () => {
  it("존재하지 않는 id로 접근하면 not found로 이동한다", async () => {
    mockFetchAdminEditorials.mockResolvedValueOnce([]);

    render(
      <MemoryRouter initialEntries={["/admin/editorials/missing-id/edit"]}>
        <Routes>
          <Route path="/admin/editorials/:id/edit" element={<AdminEditorialFormPage />} />
          <Route path="/not-found" element={<div>not found page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("not found page")).toBeInTheDocument();
    });
  });
});
