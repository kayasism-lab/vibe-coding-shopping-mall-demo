import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useOrders } from "../context/OrderContext";
import { formatKrw } from "../utils/currency";
import { USERS_API_URL, getStoredSession } from "../utils/auth";
import "./AccountPage.css";

const getPrimaryAddress = (user) => user?.addresses?.[0] || null;
const getUserKey = (user) => user?._id || user?.email || null;

function AccountPage({ user, onLogout, onUserUpdate }) {
  const { getUserOrders } = useOrders();
  const [isEditing, setIsEditing] = useState(false);
  const [saveState, setSaveState] = useState({ loading: false, error: "" });
  const [formData, setFormData] = useState({
    name: user?.name || "",
    contact: user?.contact || "",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      contact: user?.contact || "",
    });
  }, [user]);

  const orders = useMemo(() => getUserOrders(getUserKey(user)), [getUserOrders, user]);
  const primaryAddress = getPrimaryAddress(user);

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  const handleSaveProfile = async () => {
    const currentSession = getStoredSession();
    const authToken = localStorage.getItem("authToken");

    if (!currentSession || !authToken || !user?._id) {
      setSaveState({
        loading: false,
        error: "현재 로그인 세션에서는 프로필 저장을 지원하지 않습니다.",
      });
      return;
    }

    try {
      setSaveState({ loading: true, error: "" });
      const response = await fetch(`${USERS_API_URL}/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${currentSession.tokenType || "Bearer"} ${authToken}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          contact: formData.contact.replace(/\D/g, ""),
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { message: "서버 응답을 확인할 수 없습니다." };

      if (!response.ok) {
        throw new Error(data.message || "프로필 저장에 실패했습니다.");
      }

      onUserUpdate?.(data);
      setIsEditing(false);
      setSaveState({ loading: false, error: "" });
    } catch (error) {
      setSaveState({
        loading: false,
        error: error.message || "프로필 저장에 실패했습니다.",
      });
    }
  };

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="account-page">
        <div className="account-page__heading">
          <p>내 계정</p>
          <h1>{user.name}님의 계정</h1>
        </div>

        <div className="account-page__layout">
          <aside className="account-page__sidebar">
            <div className="account-page__profile-card">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>

            <nav className="account-page__nav">
              <Link to="/account">프로필</Link>
              <Link to="/account/orders">주문내역</Link>
              <Link to="/account/wishlist">위시리스트</Link>
              <Link to="/cart">장바구니</Link>
              {user.userType === "admin" ? <Link to="/admin">어드민</Link> : null}
            </nav>

            <button className="account-page__logout" type="button" onClick={onLogout}>
              로그아웃
            </button>
          </aside>

          <section className="account-page__content">
            <article className="account-page__panel">
              <div className="account-page__panel-header">
                <div>
                  <p>개인 정보</p>
                  <h2>기본 회원 정보</h2>
                </div>
                <button
                  className="account-page__text-button"
                  type="button"
                  onClick={() => {
                    setIsEditing((current) => !current);
                    setSaveState({ loading: false, error: "" });
                    setFormData({
                      name: user?.name || "",
                      contact: user?.contact || "",
                    });
                  }}
                >
                  {isEditing ? "취소" : "편집"}
                </button>
              </div>

              {isEditing ? (
                <div className="account-page__field-grid">
                  <label>
                    <span>이름</span>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    <span>연락처</span>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, contact: event.target.value }))
                      }
                    />
                  </label>
                  {saveState.error ? <p className="account-page__error">{saveState.error}</p> : null}
                  <button
                    className="account-page__primary-button"
                    disabled={saveState.loading}
                    type="button"
                    onClick={handleSaveProfile}
                  >
                    {saveState.loading ? "저장 중..." : "저장"}
                  </button>
                </div>
              ) : (
                <div className="account-page__info-grid">
                  <div>
                    <span>이름</span>
                    <strong>{user.name}</strong>
                  </div>
                  <div>
                    <span>이메일</span>
                    <strong>{user.email}</strong>
                  </div>
                  <div>
                    <span>연락처</span>
                    <strong>{user.contact || "등록된 연락처 없음"}</strong>
                  </div>
                </div>
              )}
            </article>

            <article className="account-page__panel">
              <div className="account-page__panel-header">
                <div>
                  <p>저장된 주소</p>
                  <h2>기본 배송지</h2>
                </div>
              </div>

              {primaryAddress ? (
                <div className="account-page__address">
                  <strong>{primaryAddress.label || "기본 배송지"}</strong>
                  <span>{primaryAddress.address}</span>
                </div>
              ) : (
                <p className="account-page__muted">
                  저장된 주소가 없습니다. 다음 주문에서 배송지를 입력하면 다시 확인할 수 있습니다.
                </p>
              )}
            </article>

            <article className="account-page__panel">
              <div className="account-page__panel-header">
                <div>
                  <p>최근 주문</p>
                  <h2>최근 주문</h2>
                </div>
                <Link className="account-page__text-link" to="/account/orders">
                  전체 보기
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="account-page__order-list">
                  {orders.slice(0, 3).map((order) => (
                    <div className="account-page__order-row" key={order.id}>
                      <div>
                        <strong>{order.id}</strong>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <strong>{formatKrw(order.totalPrice)}</strong>
                        <span>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="account-page__muted">아직 주문 내역이 없습니다.</p>
              )}
            </article>
          </section>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

export default AccountPage;
