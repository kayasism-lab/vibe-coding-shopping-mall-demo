import React, { useCallback, useState } from "react";
import AddressPicker from "./AddressPicker";

/**
 * 체크아웃 배송 정보 입력 단계 컴포넌트
 *
 * - 로그인 사용자: AddressPicker로 저장된 배송지 선택 (인라인 추가 불가)
 *   배송지가 없으면 마이페이지 배송지 관리 링크를 표시하고 진행을 차단한다.
 * - 비로그인 사용자: 배송지 별칭과 주소를 직접 입력하는 폼 제공
 */
function CheckoutShippingStep({ shippingData, setShippingData, user, onSubmit }) {
  const [selectedAddress, setSelectedAddress] = useState(null);
  // 로그인 사용자가 주소 미선택 시 표시할 인라인 오류
  const [addressError, setAddressError] = useState("");

  // AddressPicker에서 배송지를 선택하면 shippingData에 반영
  const handleAddressSelect = useCallback((addr) => {
    setSelectedAddress(addr);
    setAddressError("");
    setShippingData((cur) => ({
      ...cur,
      addressLabel: addr.label || "기본 배송지",
      address: addr.address || "",
    }));
  }, [setShippingData]);

  const updateField = (field) => (event) =>
    setShippingData((cur) => ({ ...cur, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    // 로그인 사용자는 반드시 배송지를 선택해야 진행 가능
    if (user && !selectedAddress) {
      setAddressError("배송지를 선택해주세요. 저장된 배송지가 없다면 배송지 관리에서 먼저 추가하세요.");
      return;
    }
    onSubmit();
  };

  return (
    <form id="checkout-shipping-form" onSubmit={handleSubmit}>
      <div className="checkout-page__section-header">
        <p>배송 정보</p>
        <h1>배송 정보를 입력해주세요</h1>
      </div>

      {/* 로그인 사용자: 저장된 배송지 목록에서 선택 */}
      {user && (
        <>
          <AddressPicker
            user={user}
            selectedAddress={selectedAddress}
            onSelectAddress={handleAddressSelect}
          />
          {addressError && (
            <p style={{ color: "#b91c1c", margin: "0 0 16px", fontSize: 14 }}>
              {addressError}
            </p>
          )}
        </>
      )}

      <div className="checkout-page__field-grid checkout-page__field-grid--two">
        <label>
          <span>받는 분</span>
          <input required type="text" value={shippingData.name} onChange={updateField("name")} />
        </label>
        <label>
          <span>이메일</span>
          <input required type="email" value={shippingData.email} onChange={updateField("email")} />
        </label>
      </div>

      <div className="checkout-page__field-grid">
        <label>
          <span>연락처</span>
          <input required type="text" value={shippingData.phone} onChange={updateField("phone")} />
        </label>

        {/* 비로그인 사용자만 배송지 별칭·주소 직접 입력 */}
        {!user && (
          <>
            <label>
              <span>배송지 별칭</span>
              <input
                type="text"
                value={shippingData.addressLabel}
                onChange={updateField("addressLabel")}
              />
            </label>
            <label>
              <span>배송 주소</span>
              <textarea
                required
                rows="4"
                value={shippingData.address}
                onChange={updateField("address")}
              />
            </label>
          </>
        )}

        <label>
          <span>배송 메모</span>
          <textarea rows="3" value={shippingData.deliveryNote} onChange={updateField("deliveryNote")} />
        </label>
      </div>

    </form>
  );
}

export default CheckoutShippingStep;
