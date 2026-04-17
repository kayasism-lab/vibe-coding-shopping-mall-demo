import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import AddressPicker from "./AddressPicker";

vi.mock("../../utils/auth", () => ({
  USERS_API_URL: "http://localhost:5000/api/users",
  getAuthorizationHeader: () => "Bearer test-token",
}));

const addresses = [
  { _id: "2", label: "회사", address: "서울 강남구", order: 2, isDefault: false },
  { _id: "1", label: "집", address: "경기 성남시", order: 1, isDefault: true },
];

function AddressPickerHarness({ onSelectAddress }) {
  const [selectedAddress, setSelectedAddress] = React.useState(null);
  const handleSelectAddress = React.useCallback((address) => {
    setSelectedAddress(address);
    onSelectAddress(address);
  }, [onSelectAddress]);

  return (
    <AddressPicker
      onSelectAddress={handleSelectAddress}
      selectedAddress={selectedAddress}
      user={{ _id: "user-1" }}
    />
  );
}

describe("AddressPicker", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads addresses, selects the default address first, and allows changing selection", async () => {
    const onSelectAddress = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      headers: { get: () => "application/json" },
      json: async () => addresses,
    });

    render(
      <MemoryRouter>
        <AddressPickerHarness onSelectAddress={onSelectAddress} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(onSelectAddress).toHaveBeenCalledWith(expect.objectContaining({ _id: "1" }));
    });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });

    expect(onSelectAddress).toHaveBeenLastCalledWith(expect.objectContaining({ _id: "2" }));
    await waitFor(() => {
      expect(screen.getByText("서울 강남구")).toBeInTheDocument();
    });
  });
});
