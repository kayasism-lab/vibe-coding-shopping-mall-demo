import { useMemo, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import "../../pages/admin/AdminPages.css";

const navItems = [
  { to: "/admin", label: "대시보드", end: true },
  { to: "/admin/main-slide", label: "메인 슬라이드" },
  { to: "/admin/main-category", label: "메인 카테고리" },
  { to: "/admin/products", label: "상품" },
  { to: "/admin/editorials", label: "에디토리얼" },
  { to: "/admin/orders", label: "주문" },
  { to: "/admin/customers", label: "고객" },
  { to: "/admin/reports", label: "리포트" },
];

function AdminLayout({ user, onLogout }) {
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const initials = useMemo(() => {
    if (!user?.name) {
      return "A";
    }

    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() || "")
      .join("");
  }, [user]);

  if (!user) {
    return <Navigate replace to="/login" state={{ from: location.pathname }} />;
  }

  if (user.userType !== "admin") {
    return <Navigate replace to="/account" />;
  }

  return (
    <div className="admin-shell">
      <header className="admin-shell__mobile-header">
        <Link className="admin-shell__brand-link" to="/admin">
          Moon Admin
        </Link>
        <button
          className="admin-shell__menu-button"
          type="button"
          onClick={() => setIsMobileNavOpen((current) => !current)}
        >
          {isMobileNavOpen ? "닫기" : "메뉴"}
        </button>
      </header>

      <aside className={`admin-shell__sidebar ${isMobileNavOpen ? "is-open" : ""}`}>
        <div className="admin-shell__sidebar-top">
          <Link className="admin-shell__brand-link" to="/admin" onClick={() => setIsMobileNavOpen(false)}>
            Moon Atelier
          </Link>
          <p>관리자 패널</p>
        </div>

        <nav className="admin-shell__nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                `admin-shell__nav-link ${isActive ? "is-active" : ""}`
              }
              end={item.end}
              to={item.to}
              onClick={() => setIsMobileNavOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-shell__sidebar-bottom">
          <div className="admin-shell__user-card">
            <span>{initials}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>

          <Link className="admin-shell__secondary-link" to="/">
            스토어 보기
          </Link>
          <button className="admin-shell__logout" type="button" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </aside>

      {isMobileNavOpen ? (
        <button
          aria-label="관리자 메뉴 닫기"
          className="admin-shell__backdrop"
          type="button"
          onClick={() => setIsMobileNavOpen(false)}
        />
      ) : null}

      <main className="admin-shell__content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
