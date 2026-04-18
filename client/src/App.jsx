import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { CartProvider } from "./context/CartContext";
import { EditorialProvider } from "./context/EditorialContext";
import { useOrders } from "./context/OrderContext";
import { WishlistProvider } from "./context/WishlistContext";
import { clearStoredSession, getStoredSession, persistSession } from "./utils/auth";
import AdminLayout from "./components/admin/AdminLayout";

const AccountPage = lazy(() => import("./pages/AccountPage"));
const AddressManagePage = lazy(() => import("./pages/AddressManagePage"));
const PasswordChangePage = lazy(() => import("./pages/PasswordChangePage"));
const AdminCustomersPage = lazy(() => import("./pages/admin/AdminCustomersPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminMainSlidePage = lazy(() => import("./pages/admin/AdminMainSlidePage"));
const AdminMainCategoryPage = lazy(() => import("./pages/admin/AdminMainCategoryPage"));
const AdminEditorialFormPage = lazy(() => import("./pages/admin/AdminEditorialFormPage"));
const AdminEditorialsPage = lazy(() => import("./pages/admin/AdminEditorialsPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminProductFormPage = lazy(() => import("./pages/admin/AdminProductFormPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminReportDetailPage = lazy(() => import("./pages/admin/AdminReportDetailPage"));
const AdminReportsPage = lazy(() => import("./pages/admin/AdminReportsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CheckoutFailPage = lazy(() => import("./pages/CheckoutFailPage"));
const CheckoutSuccessPage = lazy(() => import("./pages/CheckoutSuccessPage"));
const EditorialPage = lazy(() => import("./pages/EditorialPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
}

function App() {
  const navigate = useNavigate();
  const { refreshOrders } = useOrders();
  const [authSession, setAuthSession] = useState(() => getStoredSession());
  const cartUserKey =
    authSession?.user?._id ||
    authSession?.user?.id ||
    authSession?.user?.email ||
    "";
  const handleUserUpdate = useCallback((updatedUser) => {
    setAuthSession((currentSession) => {
      if (!currentSession) {
        return currentSession;
      }

      const nextSession = {
        ...currentSession,
        user: updatedUser,
        authIdentity: updatedUser,
      };

      persistSession(nextSession);

      return nextSession;
    });
  }, []);

  const handleLogout = useCallback(() => {
    clearStoredSession();
    setAuthSession(null);
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    refreshOrders();
  }, [authSession, refreshOrders]);

  return (
    <main className="app-shell">
      <ScrollToTop />
      <CartProvider key={cartUserKey || "guest"} userKey={cartUserKey}>
        <WishlistProvider key={cartUserKey || "guest"} userKey={cartUserKey}>
          <EditorialProvider>
            <Suspense fallback={<div className="app-shell__loading">페이지를 불러오는 중...</div>}>
              <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    user={authSession?.user || null}
                    onLogout={handleLogout}
                  />
                }
              />
              <Route
                path="/product/:id"
                element={<ProductPage user={authSession?.user || null} onLogout={handleLogout} />}
              />
              <Route
                path="/category/:slug"
                element={<CategoryPage user={authSession?.user || null} onLogout={handleLogout} />}
              />
              <Route
                path="/editorial/:slug"
                element={<EditorialPage user={authSession?.user || null} onLogout={handleLogout} />}
              />
              <Route
                path="/cart"
                element={<CartPage user={authSession?.user || null} onLogout={handleLogout} />}
              />
              <Route
                path="/checkout"
                element={<CheckoutPage user={authSession?.user || null} onLogout={handleLogout} />}
              />
              <Route
                path="/checkout/success"
                element={<CheckoutSuccessPage user={authSession?.user || null} onLogout={handleLogout} />}
              />
              <Route
                path="/checkout/fail"
                element={<CheckoutFailPage user={authSession?.user || null} onLogout={handleLogout} />}
              />
              <Route
                path="/account"
                element={
                  <AccountPage
                    user={authSession?.user || null}
                    onLogout={handleLogout}
                    onUserUpdate={handleUserUpdate}
                  />
                }
              />
              <Route
                path="/account/addresses"
                element={
                  <AddressManagePage
                    user={authSession?.user || null}
                    onLogout={handleLogout}
                    onUserUpdate={handleUserUpdate}
                  />
                }
              />
              <Route
                path="/account/password"
                element={
                  <PasswordChangePage
                    user={authSession?.user || null}
                    onLogout={handleLogout}
                  />
                }
              />
              <Route
                path="/account/orders"
                element={<OrdersPage user={authSession?.user || null} onLogout={handleLogout} />}
              />
              <Route
                path="/account/wishlist"
                element={<WishlistPage user={authSession?.user || null} onLogout={handleLogout} />}
              />
              <Route
                path="/search"
                element={<SearchPage user={authSession?.user || null} onLogout={handleLogout} />}
              />
              <Route
                path="/login"
                element={
                  <LoginPage
                    onBackToStore={() => navigate("/")}
                    onForgotPassword={() => navigate("/forgot-password")}
                    onSignup={() => navigate("/register")}
                    onLoginSuccess={(session) => {
                      setAuthSession(session);
                      navigate("/");
                    }}
                  />
                }
              />
              <Route path="/register" element={<SignupPage onBack={() => navigate("/")} />} />
              <Route path="/signup" element={<Navigate replace to="/register" />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/admin"
                element={<AdminLayout user={authSession?.user || null} onLogout={handleLogout} />}
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="home-content" element={<Navigate replace to="/admin/main-slide" />} />
                <Route path="main-slide" element={<AdminMainSlidePage />} />
                <Route path="main-category" element={<AdminMainCategoryPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<AdminProductFormPage />} />
                <Route path="products/:id/edit" element={<AdminProductFormPage />} />
                <Route path="editorials" element={<AdminEditorialsPage />} />
                <Route path="editorials/new" element={<AdminEditorialFormPage />} />
                <Route path="editorials/:id/edit" element={<AdminEditorialFormPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="reports/:id" element={<AdminReportDetailPage />} />
              </Route>
              <Route path="/not-found" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
              </Routes>
            </Suspense>
          </EditorialProvider>
        </WishlistProvider>
      </CartProvider>
    </main>
  );
}

export default App;
