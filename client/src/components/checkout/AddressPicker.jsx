import React, { useEffect, useState } from "react";
import { getAuthorizationHeader, USERS_API_URL } from "../../utils/auth";

// order 값 기준으로 주소 목록을 오름차순 정렬한다.
const sortByOrder = (list) =>
  [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const getJsonIfPossible = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : null;
};

function AddressPicker({ user, selectedAddress, onSelectAddress }) {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [addError, setAddError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 마운트 시 주소 목록을 서버에서 조회하고 첫 번째 주소를 자동 선택한다.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setFetchError("");
      try {
        const authorizationHeader = getAuthorizationHeader();
        const res = await fetch(`${USERS_API_URL}/${user._id}/addresses`, {
          headers: authorizationHeader ? { Authorization: authorizationHeader } : {},
        });
        const data = await getJsonIfPossible(res);
        if (!res.ok) throw new Error(data?.message || `주소 목록 조회 실패 (${res.status})`);
        if (!Array.isArray(data)) throw new Error("주소 목록을 불러올 수 없습니다.");
        if (cancelled) return;
        const sorted = sortByOrder(data);
        setAddresses(sorted);
        // order가 가장 작은 첫 번째 주소를 초기 선택한다.
        if (sorted.length > 0) onSelectAddress(sorted[0]);
      } catch (err) {
        if (!cancelled) setFetchError(err.message || "주소 목록을 불러올 수 없습니다.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 인라인 폼 제출: 새 주소를 서버에 저장하고 목록에 즉시 추가한다.
  const handleAddSubmit = async (event) => {
    event.preventDefault();
    setAddError("");
    setIsSubmitting(true);
    try {
      const authorizationHeader = getAuthorizationHeader();
      const res = await fetch(`${USERS_API_URL}/${user._id}/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
        },
        body: JSON.stringify({
          label: newLabel.trim(),
          address: newAddress.trim(),
          order: addresses.length + 1,
        }),
      });
      const created = await getJsonIfPossible(res);
      if (!res.ok) throw new Error(created?.message || `주소 추가 실패 (${res.status})`);
      if (!created) throw new Error("주소를 추가할 수 없습니다.");
      // 즉시 목록에 추가하고 새 주소를 자동 선택한다.
      setAddresses((prev) => [...prev, created]);
      onSelectAddress(created);
      setNewLabel("");
      setNewAddress("");
      setShowAddForm(false);
    } catch (err) {
      setAddError(err.message || "주소를 추가할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="address-picker">
        <p className="address-picker__loading">배송지 목록 불러오는 중...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="address-picker">
        <p className="address-picker__error">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="address-picker">
      {/* 저장된 주소 카드 목록 */}
      <ul className="address-picker__list">
        {addresses.map((addr) => {
          const isSelected =
            selectedAddress &&
            (selectedAddress._id === addr._id || selectedAddress === addr);
          return (
            <li
              key={addr._id ?? addr.label}
              className={`address-picker__card${isSelected ? " address-picker__card--selected" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectAddress(addr)}
              onKeyDown={(e) => e.key === "Enter" && onSelectAddress(addr)}
            >
              <strong>{addr.label}</strong>
              <span>{addr.address}</span>
            </li>
          );
        })}
      </ul>

      {/* 새 주소 추가 토글 버튼 */}
      <button
        className="address-picker__add-btn checkout-page__text-button"
        type="button"
        onClick={() => setShowAddForm((prev) => !prev)}
      >
        {showAddForm ? "취소" : "+ 새 주소 추가"}
      </button>

      {/* 인라인 주소 추가 폼 */}
      {showAddForm && (
        <form
          className="address-picker__form checkout-page__field-grid"
          onSubmit={handleAddSubmit}
        >
          <label>
            <span>별칭</span>
            <input
              required
              type="text"
              placeholder="예: 집, 회사"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </label>
          <label>
            <span>주소</span>
            <textarea
              required
              rows="3"
              placeholder="상세 주소를 입력하세요"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
          </label>
          {addError && <p className="address-picker__error">{addError}</p>}
          <button
            className="checkout-page__primary-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "주소 저장"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddressPicker;
