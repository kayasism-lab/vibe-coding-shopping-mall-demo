import { describe, expect, it } from "vitest";
import { findDefaultAddress, sortAddresses, validateAddressForm } from "./addressUtils";

// 테스트용 주소 픽스처
const makeAddr = (id, order, isDefault = false) => ({
  _id: id,
  label: `주소${id}`,
  address: `서울 ${id}`,
  order,
  isDefault,
});

describe("sortAddresses", () => {
  it("빈 배열 또는 비-배열 입력에 안전하게 동작한다", () => {
    expect(sortAddresses([])).toEqual([]);
    expect(sortAddresses(null)).toEqual([]);
    expect(sortAddresses(undefined)).toEqual([]);
  });

  it("기본 배송지를 항상 맨 앞에 정렬한다", () => {
    const list = [makeAddr("a", 1), makeAddr("b", 2, true), makeAddr("c", 3)];
    const result = sortAddresses(list);
    expect(result[0]._id).toBe("b");
  });

  it("기본 배송지가 없으면 order 오름차순으로 정렬한다", () => {
    const list = [makeAddr("c", 3), makeAddr("a", 1), makeAddr("b", 2)];
    const result = sortAddresses(list);
    expect(result.map((r) => r._id)).toEqual(["a", "b", "c"]);
  });

  it("원본 배열을 변경하지 않는다", () => {
    const list = [makeAddr("b", 2, true), makeAddr("a", 1)];
    const copy = [...list];
    sortAddresses(list);
    expect(list).toEqual(copy);
  });
});

describe("findDefaultAddress", () => {
  it("빈 배열 및 null 입력에서 null을 반환한다", () => {
    expect(findDefaultAddress([])).toBeNull();
    expect(findDefaultAddress(null)).toBeNull();
  });

  it("isDefault=true인 주소를 반환한다", () => {
    const list = [makeAddr("a", 1), makeAddr("b", 2, true)];
    expect(findDefaultAddress(list)._id).toBe("b");
  });

  it("기본 배송지가 없으면 첫 번째 주소를 반환한다", () => {
    const list = [makeAddr("x", 1), makeAddr("y", 2)];
    expect(findDefaultAddress(list)._id).toBe("x");
  });
});

describe("validateAddressForm", () => {
  it("label이 비어 있으면 오류 메시지를 반환한다", () => {
    expect(validateAddressForm({ label: "", address: "서울" })).toBeTruthy();
    expect(validateAddressForm({ label: "  ", address: "서울" })).toBeTruthy();
  });

  it("address가 비어 있으면 오류 메시지를 반환한다", () => {
    expect(validateAddressForm({ label: "집", address: "" })).toBeTruthy();
    expect(validateAddressForm({ label: "집", address: "   " })).toBeTruthy();
  });

  it("label과 address가 모두 유효하면 null을 반환한다", () => {
    expect(validateAddressForm({ label: "집", address: "서울시 강남구" })).toBeNull();
  });
});
