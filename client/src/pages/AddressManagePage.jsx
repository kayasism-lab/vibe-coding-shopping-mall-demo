import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AccountSidebar from "../components/account/AccountSidebar";
import AddressManageForm from "../components/account/AddressManageForm";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { getAuthorizationHeader, USERS_API_URL } from "../utils/auth";
import { sortAddresses, validateAddressForm } from "../utils/addressUtils";
import "./AccountPage.css";

const parseJson = async (res) => {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : null;
};

const emptyForm = { label: "", address: "" };

function AddressManagePage({ user, onLogout, onUserUpdate }) {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const userId = user?._id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = async () => {
      const authHeader = getAuthorizationHeader();
      const url = `${USERS_API_URL}/${userId}/addresses`;
      setIsLoading(true);
      setFetchError("");
      try {
        const res = await fetch(url, {
          headers: authHeader ? { Authorization: authHeader } : {},
        });
        const data = await parseJson(res);
        if (!res.ok) throw new Error(data?.message || "주소 목록 조회에 실패했습니다.");
        if (!cancelled) setAddresses(sortAddresses(data));
      } catch (err) {
        if (!cancelled) setFetchError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (!user) return <Navigate replace to="/login" />;

  const authHeader = getAuthorizationHeader();
  const baseUrl = `${USERS_API_URL}/${user._id}/addresses`;

  const syncSession = (nextAddresses) => {
    onUserUpdate?.({ ...user, addresses: nextAddresses });
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    const error = validateAddressForm(formData);
    if (error) { setFormError(error); return; }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(authHeader ? { Authorization: authHeader } : {}) },
        body: JSON.stringify({ label: formData.label.trim(), address: formData.address.trim() }),
      });
      const created = await parseJson(res);
      if (!res.ok) throw new Error(created?.message || "주소 추가에 실패했습니다.");
      const next = sortAddresses([...addresses, created]);
      setAddresses(next);
      syncSession(next);
      setFormData(emptyForm);
      setShowAddForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();
    const error = validateAddressForm(formData);
    if (error) { setFormError(error); return; }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch(`${baseUrl}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(authHeader ? { Authorization: authHeader } : {}) },
        body: JSON.stringify({ label: formData.label.trim(), address: formData.address.trim() }),
      });
      const updated = await parseJson(res);
      if (!res.ok) throw new Error(updated?.message || "주소 수정에 실패했습니다.");
      const next = sortAddresses(addresses.map((a) => (a._id === editingId ? updated : a)));
      setAddresses(next);
      syncSession(next);
      setEditingId(null);
      setFormData(emptyForm);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addressId) => {
    setDeletingId(addressId);
    try {
      const res = await fetch(`${baseUrl}/${addressId}`, {
        method: "DELETE",
        headers: authHeader ? { Authorization: authHeader } : {},
      });
      if (!res.ok) {
        const data = await parseJson(res);
        throw new Error(data?.message || "주소 삭제에 실패했습니다.");
      }
      const refreshRes = await fetch(baseUrl, { headers: authHeader ? { Authorization: authHeader } : {} });
      const refreshed = await parseJson(refreshRes);
      const next = sortAddresses(refreshed || []);
      setAddresses(next);
      syncSession(next);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const res = await fetch(`${baseUrl}/${addressId}/default`, {
        method: "PATCH",
        headers: authHeader ? { Authorization: authHeader } : {},
      });
      const updated = await parseJson(res);
      if (!res.ok) throw new Error(updated?.message || "기본 배송지 설정에 실패했습니다.");
      const next = sortAddresses(addresses.map((a) => ({ ...a, isDefault: a._id === addressId })));
      setAddresses(next);
      syncSession(next);
    } catch (err) {
      setFetchError(err.message);
    }
  };

  const startEdit = (addr) => {
    setEditingId(addr._id);
    setFormData({ label: addr.label, address: addr.address });
    setFormError("");
    setShowAddForm(false);
  };

  const cancelForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData(emptyForm);
    setFormError("");
  };

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="account-page">
        <div className="account-page__heading">
          <p>내 계정</p>
          <h1>배송지 관리</h1>
        </div>

        <div className="account-page__layout">
          <AccountSidebar onLogout={onLogout} user={user} />

          <section className="account-page__content">
            <article className="account-page__panel">
              <div className="account-page__panel-header">
                <div>
                  <p>저장된 배송지</p>
                  <h2>배송지 목록</h2>
                </div>
                {!showAddForm && !editingId && (
                  <button
                    className="account-page__text-button"
                    type="button"
                    onClick={() => { setShowAddForm(true); setFormData(emptyForm); setFormError(""); }}
                  >
                    + 추가
                  </button>
                )}
              </div>

              {fetchError && <p className="account-page__error">{fetchError}</p>}

              {showAddForm && (
                <AddressManageForm
                  formData={formData}
                  setFormData={setFormData}
                  formError={formError}
                  submitting={submitting}
                  onSubmit={handleAdd}
                  onCancel={cancelForm}
                  submitLabel="추가"
                />
              )}

              {isLoading ? (
                <p className="account-page__muted">주소 목록을 불러오는 중...</p>
              ) : addresses.length === 0 ? (
                <p className="account-page__muted">
                  저장된 배송지가 없습니다. 위의 추가 버튼을 눌러 배송지를 등록하세요.
                </p>
              ) : (
                <div className="address-manage__list">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="address-manage__item">
                      {editingId === addr._id ? (
                        <AddressManageForm
                          formData={formData}
                          setFormData={setFormData}
                          formError={formError}
                          submitting={submitting}
                          onSubmit={handleEdit}
                          onCancel={cancelForm}
                          submitLabel="저장"
                        />
                      ) : (
                        <>
                          <div className="address-manage__info">
                            <strong>
                              {addr.label}
                              {addr.isDefault && (
                                <span className="address-manage__badge">기본</span>
                              )}
                            </strong>
                            <span>{addr.address}</span>
                          </div>
                          <div className="address-manage__actions">
                            {!addr.isDefault && (
                              <button
                                className="account-page__text-button"
                                type="button"
                                onClick={() => handleSetDefault(addr._id)}
                              >
                                기본 지정
                              </button>
                            )}
                            <button
                              className="account-page__text-button"
                              type="button"
                              onClick={() => startEdit(addr)}
                            >
                              편집
                            </button>
                            <button
                              className="account-page__text-button"
                              type="button"
                              disabled={deletingId === addr._id}
                              onClick={() => handleDelete(addr._id)}
                            >
                              {deletingId === addr._id ? "삭제 중..." : "삭제"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

export default AddressManagePage;
