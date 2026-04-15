import { Link, Navigate } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { formatKrw } from "../utils/currency";
import "./SearchPage.css";

function WishlistPage({ user, onLogout }) {
  const { addItem } = useCart();
  const { items, removeItem } = useWishlist();

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="wishlist-page">
        <header className="wishlist-page__header">
          <div>
            <p>위시리스트</p>
            <h1>좋아하는 상품 모음</h1>
          </div>
          <div className="wishlist-page__meta">{items.length}개 저장됨</div>
        </header>

        {items.length > 0 ? (
          <section className="wishlist-page__grid">
            {items.map((product) => (
              <article className="wishlist-page__card" key={product.sku}>
                <div className="wishlist-page__media">
                  <button
                    aria-label="위시리스트에서 제거"
                    className="wishlist-page__remove"
                    type="button"
                    onClick={() => removeItem(product.sku)}
                  >
                    ×
                  </button>
                  <Link to={`/product/${product.sku}`}>
                    <img alt={product.name} loading="lazy" src={product.image} />
                  </Link>
                </div>

                <div className="wishlist-page__card-body">
                  <small>{product.category}</small>
                  <Link style={{ color: "inherit", textDecoration: "none" }} to={`/product/${product.sku}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <p>{product.description}</p>
                  <div className="wishlist-page__colors">
                    {product.colors.slice(0, 4).map((color) => (
                      <span key={color.name} style={{ backgroundColor: color.hex }} title={color.name} />
                    ))}
                  </div>
                  <strong>{formatKrw(product.price)}</strong>
                  <button
                    className="wishlist-page__cart"
                    type="button"
                    onClick={() =>
                      addItem(
                        product,
                        product.colors[0]?.name || "Default",
                        product.sizes[0] || "One Size"
                      )
                    }
                  >
                    장바구니 담기
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="wishlist-page__empty">
            <h2>위시리스트가 비어 있습니다.</h2>
            <p>상품 상세나 검색 결과에서 마음에 드는 상품을 저장해보세요.</p>
            <Link to="/search">검색하러 가기</Link>
          </section>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

export default WishlistPage;
