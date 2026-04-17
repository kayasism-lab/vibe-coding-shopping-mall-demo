import React from "react";
import { Link } from "react-router-dom";

function AccountSidebar({ user, onLogout }) {
  return (
    <aside className="account-page__sidebar">
      <div className="account-page__profile-card">
        <strong>{user.name}</strong>
        <span>{user.email}</span>
      </div>
      <nav className="account-page__nav">
        <Link to="/account">프로필</Link>
        <Link to="/account/orders">주문내역</Link>
        <Link to="/account/wishlist">위시리스트</Link>
        <Link to="/account/addresses">배송지 관리</Link>
        {/* 비밀번호 변경 페이지 링크 */}
        <Link to="/account/password">비밀번호 변경</Link>
        <Link to="/cart">장바구니</Link>
        {user.userType === "admin" ? <Link to="/admin">어드민</Link> : null}
      </nav>
      <button className="account-page__logout" type="button" onClick={onLogout}>
        로그아웃
      </button>
    </aside>
  );
}

export default AccountSidebar;
