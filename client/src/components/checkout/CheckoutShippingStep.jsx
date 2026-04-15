import { useState } from "react";
import AddressPicker from "./AddressPicker";

/**
 * 체크아웃 배송 정보 입력 단계 컴포넌트
 *
 * - 로그인 사용자: AddressPicker로 주소 선택 + 이름/이메일/연락처/배송메모 입력
 * - 비로그인 사용자: 전체 수동 입력 폼
 */
function CheckoutShippingStep({ shippingData, setShippingData, user, onSubmit }) {
  // 로그인 사용자가 선택한 주소 상태
  const [selectedAddress, setSelectedAddress] = useState(null);

  // AddressPicker 주소 선택 시 shippingData에 자동 반영
  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr);
    setShippingData((cur) => ({
      ...cur,
      addressLabel: addr.label || "기본 배송지",
      address: addr.address || "",
    }));
  };

  // shippingData 필드 단일 업데이트 헬퍼
  const updateField = (field) => (event) =>
    setShippingData((cur) => ({ ...cur, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="checkout-page__section-header">
        <p>배송 정보</p>
        <h1>배송 정보를 입력해주세요</h1>
      </div>

      {/* 로그인 사용자: AddressPicker로 주소 선택 */}
      {user && (
        <AddressPicker
          user={user}
          selectedAddress={selectedAddress}
          onSelectAddress={handleAddressSelect}
        />
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

      <button className="checkout-page__primary-button" type="submit">
        결제 단계로 이동
      </button>
    </form>
  );
}

export default CheckoutShippingStep;
