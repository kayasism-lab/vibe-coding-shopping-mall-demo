import React from "react";

function AddressManageForm({
  formData,
  setFormData,
  formError,
  submitting,
  onSubmit,
  onCancel,
  submitLabel,
}) {
  return (
    <form className="account-page__field-grid address-manage__form" onSubmit={onSubmit}>
      <label>
        <span>별칭 (예: 집, 회사)</span>
        <input
          required
          type="text"
          value={formData.label}
          onChange={(e) => setFormData((cur) => ({ ...cur, label: e.target.value }))}
        />
      </label>
      <label>
        <span>배송 주소</span>
        <textarea
          required
          rows="3"
          value={formData.address}
          onChange={(e) => setFormData((cur) => ({ ...cur, address: e.target.value }))}
        />
      </label>
      {formError ? <p className="account-page__error">{formError}</p> : null}
      <div className="address-manage__form-actions">
        <button className="account-page__primary-button" type="submit" disabled={submitting}>
          {submitting ? "저장 중..." : submitLabel}
        </button>
        <button className="account-page__text-button" type="button" onClick={onCancel}>
          취소
        </button>
      </div>
    </form>
  );
}

export default AddressManageForm;
