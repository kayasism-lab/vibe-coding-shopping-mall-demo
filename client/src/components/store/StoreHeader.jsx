import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import StoreNavigation from "./StoreNavigation.jsx";
import "./store.css";

function BagIcon() {
  return (
    <svg aria-hidden="true" className="store-cart-button__icon" viewBox="0 0 24 24">
      <path
        d="M7 9V7a5 5 0 0 1 10 0v2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M5 9h14l-1 10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 9Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function AdminGearIcon() {
  return (
    <svg aria-hidden="true" className="store-actions__admin-icon" viewBox="0 0 24 24">
      <path
        d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M19.2 15.1a1 1 0 0 0 .2 1.1l.1.1a1.2 1.2 0 0 1 0 1.7l-.8.8a1.2 1.2 0 0 1-1.7 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.2 1.2 0 0 1-1.2 1.2h-1.1A1.2 1.2 0 0 1 10.7 20v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.2 1.2 0 0 1-1.7 0l-.8-.8a1.2 1.2 0 0 1 0-1.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4A1.2 1.2 0 0 1 2.8 13v-1.1A1.2 1.2 0 0 1 4 10.7h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.2 1.2 0 0 1 0-1.7l.8-.8a1.2 1.2 0 0 1 1.7 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4A1.2 1.2 0 0 1 10.8 2.8h1.1A1.2 1.2 0 0 1 13.1 4v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1.2 1.2 0 0 1 1.7 0l.8.8a1.2 1.2 0 0 1 0 1.7l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2A1.2 1.2 0 0 1 21.2 12v1.1a1.2 1.2 0 0 1-1.2 1.2h-.2a1 1 0 0 0-.9.8Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function StoreHeader({ user, onLogout }) {
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen, justAdded } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="store-header">
      <div className="store-header__main">
        <button
          aria-controls="store-mobile-panel"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          className="store-mobile-toggle"
          type="button"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
        >
          {isMobileMenuOpen ? "닫기" : "메뉴"}
        </button>

        <StoreNavigation className="store-nav store-nav--desktop" />

        <div className="store-branding">
          <span className="store-branding__eyebrow">달빛공방</span>
          <Link className="store-brand-link" to="/">
            <h1>Moon Atelier</h1>
          </Link>
        </div>

        <div className="store-actions">
          <Link className="store-action-link" to="/search">
            검색
          </Link>

          {user ? (
            <span className="store-actions__user">
              {user.userType === "admin" ? (
                <Link
                  aria-label="어드민 페이지로 이동"
                  className="store-actions__admin-link"
                  to="/admin"
                >
                  <AdminGearIcon />
                </Link>
              ) : null}
              {user.userType === "admin" ? (
                <span className="store-actions__admin-badge">관리자</span>
              ) : null}
              <span>{user.name}님 환영합니다</span>
            </span>
          ) : null}

          {user ? (
            <Link className="store-action-link" to="/account/wishlist">
              위시리스트
            </Link>
          ) : null}

          {user ? (
            <Link className="store-action-link" to="/account">
              마이페이지
            </Link>
          ) : null}

          {user ? (
            <button className="store-action-link" type="button" onClick={onLogout}>
              로그아웃
            </button>
          ) : (
            <>
              <button className="store-action-link" type="button" onClick={() => navigate("/login")}>
                로그인
              </button>
              <button className="store-action-link" type="button" onClick={() => navigate("/signup")}>
                회원가입
              </button>
            </>
          )}

          <button className="store-action-link store-action-link--bag" type="button" onClick={() => setIsCartOpen(true)}>
            <BagIcon />
            <span className="store-cart-button__count">
              {totalItems}
              {justAdded ? "+" : ""}
            </span>
          </button>
        </div>

        <button className="store-cart-button store-cart-button--mobile" type="button" onClick={() => setIsCartOpen(true)}>
          <BagIcon />
          <span className="store-cart-button__count">
            {totalItems}
            {justAdded ? "+" : ""}
          </span>
        </button>
      </div>

      <div
        className={`store-mobile-panel ${isMobileMenuOpen ? "store-mobile-panel--open" : ""}`}
        id="store-mobile-panel"
      >
        <StoreNavigation
          className="store-nav store-nav--mobile"
          onNavigate={() => setIsMobileMenuOpen(false)}
        />

        <div className="store-mobile-panel__actions">
          <Link className="store-action-link" to="/search">
            검색
          </Link>

          {user ? (
            <>
              <Link className="store-action-link" to="/account/wishlist">
                위시리스트
              </Link>
              {user.userType === "admin" ? (
                <Link className="store-action-link" to="/admin">
                  관리자 페이지
                </Link>
              ) : null}
              <Link className="store-action-link" to="/account">
                마이페이지
              </Link>
              <button className="store-action-link" type="button" onClick={onLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button className="store-action-link" type="button" onClick={() => navigate("/login")}>
                로그인
              </button>
              <button className="store-action-link" type="button" onClick={() => navigate("/signup")}>
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default StoreHeader;
