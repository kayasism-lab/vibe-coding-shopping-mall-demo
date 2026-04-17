import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthorizationHeader, USERS_API_URL } from "../../utils/auth";
import { sortAddresses } from "../../utils/addressUtils";

// JSON 응답 안전 파싱 헬퍼
const parseJson = async (res) => {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : null;
};

/**
 * 체크아웃 배송지 선택 컴포넌트
 *
 * - 저장된 배송지 목록을 조회해 카드 형태로 표시한다.
 * - 기본 배송지가 맨 앞에 위치하며 로드 시 자동 선택된다.
 * - 배송지가 없을 경우 배송지 관리 페이지 링크를 제공한다.
 * - 인라인 주소 추가 기능은 제거되었다. 로그인 사용자는 마이페이지에서 관리한다.
 */
function AddressPicker({ user, selectedAddress, onSelectAddress }) {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const selectedAddressId = selectedAddress?._id || "";
  const selectedSummary = addresses.find((address) => address._id === selectedAddressId) || addresses[0];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setFetchError("");
      try {
        const authHeader = getAuthorizationHeader();
        const res = await fetch(`${USERS_API_URL}/${user._id}/addresses`, {
          headers: authHeader ? { Authorization: authHeader } : {},
        });
        const data = await parseJson(res);
        if (!res.ok) throw new Error(data?.message || `주소 목록 조회 실패 (${res.status})`);
        if (!Array.isArray(data)) throw new Error("주소 목록을 불러올 수 없습니다.");
        if (cancelled) return;
        const sorted = sortAddresses(data);
        setAddresses(sorted);
        if (sorted.length > 0) onSelectAddress(sorted[0]);
      } catch (err) {
        if (!cancelled) setFetchError(err.message || "주소 목록을 불러올 수 없습니다.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [onSelectAddress, user._id]);

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

  // 저장된 배송지가 없으면 마이페이지 안내 메시지 표시
  if (addresses.length === 0) {
    return (
      <div className="address-picker address-picker--empty">
        <p>저장된 배송지가 없습니다.</p>
        <Link className="address-picker__manage-link" to="/account/addresses">
          배송지 관리에서 주소를 추가하세요 →
        </Link>
      </div>
    );
  }

  return (
    <div className="address-picker">
      <label className="address-picker__select-field">
        <span>배송지 선택</span>
        <select
          value={selectedSummary?._id || ""}
          onChange={(event) => {
            const nextAddress = addresses.find((address) => address._id === event.target.value);
            if (nextAddress) {
              onSelectAddress(nextAddress);
            }
          }}
        >
          {addresses.map((addr) => (
            <option key={addr._id ?? addr.label} value={addr._id}>
              {addr.label}{addr.isDefault ? " (기본)" : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="address-picker__summary">
        <strong>
          {selectedSummary?.label}
          {selectedSummary?.isDefault ? <span className="address-picker__default-badge">기본</span> : null}
        </strong>
        <span>{selectedSummary?.address}</span>
      </div>

      <Link className="address-picker__manage-link" to="/account/addresses">
        배송지 관리
      </Link>
    </div>
  );
}

export default AddressPicker;
