import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import ProductImageWithHover from "../components/store/ProductImageWithHover";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useCart } from "../context/CartContext";
import { useProducts } from "../context/ProductContext";
import { useWishlist } from "../context/WishlistContext";
import { getRelatedProducts } from "../utils/productCatalog";
import { formatKrw } from "../utils/currency";
import "./ProductPage.css";

const SUBNAV_DETAIL = "detail";
const SUBNAV_RELATED = "related";

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function ProductPageContent({ product, relatedProducts, user, onLogout }) {
  const navigate = useNavigate();
  const { addItem, setIsCartOpen } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const [selectedSize, setSelectedSize] = useState("");
  const primaryColor = product.colors[0] || null;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const [activeSubnav, setActiveSubnav] = useState(SUBNAV_DETAIL);
  const isAddToCartDisabled = !primaryColor || !selectedSize;
  const addToCartButtonLabel = showAddedMessage
    ? "장바구니에 담겼습니다"
    : isAddToCartDisabled
      ? "사이즈를 선택해주세요"
      : "장바구니 담기";
  const relatedCollectionLabel =
    product.category2 === "Men"
      ? "Men"
      : product.category2 === "Accessories"
        ? "Accessories"
        : "Women";

  const hasDescription = Boolean(product.descriptionImages?.length);
  const hasRelated = relatedProducts.length > 0;
  const subnavTitleId = useId();

  const handleAddToCart = () => {
    if (!primaryColor || !selectedSize) {
      return;
    }

    addItem(product, primaryColor.name, selectedSize, quantity);
    setShowAddedMessage(true);

    window.setTimeout(() => {
      setShowAddedMessage(false);
      setIsCartOpen(true);
    }, 800);
  };

  const onSubnavClickDetail = () => {
    if (hasDescription) {
      scrollToId("section-description");
    } else {
      scrollToId("section-gallery");
    }
  };

  const refreshActiveFromScroll = useCallback(() => {
    const vh = window.innerHeight;
    const band = vh * 0.2;
    const rel = document.getElementById("section-related");
    if (rel) {
      const r = rel.getBoundingClientRect();
      if (r.top < vh * 0.55 && r.bottom > band) {
        setActiveSubnav(SUBNAV_RELATED);
        return;
      }
    }
    if (hasDescription) {
      const d = document.getElementById("section-description");
      if (d) {
        const r = d.getBoundingClientRect();
        if (r.top < vh * 0.5 && r.bottom > band) {
          setActiveSubnav(SUBNAV_DETAIL);
          return;
        }
      }
    }
    setActiveSubnav(SUBNAV_DETAIL);
  }, [hasDescription, hasRelated]);

  useEffect(() => {
    refreshActiveFromScroll();
    let ticking = false;
    const onScroll = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        refreshActiveFromScroll();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [refreshActiveFromScroll]);

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="product-page">
        <div className="product-page__inner">
          <div className="product-page__breadcrumbs">
            <Link to="/">홈</Link>
            <span>/</span>
            <Link
              to={`/category/${product.category2 === "Men" ? "men" : product.category2 === "Accessories" ? "accessories" : "women"}`}
            >
              {product.category2 === "Men"
                ? "Men"
                : product.category2 === "Accessories"
                  ? "Accessories"
                  : "Women"}
            </Link>
            <span>/</span>
            <Link to={`/category/${product.category.toLowerCase()}`}>{product.category}</Link>
            <span>/</span>
            <strong>{product.name}</strong>
          </div>

          <div
            className={`product-page__pdp ${hasDescription ? "product-page__pdp--with-desc" : ""}`.trim()}
          >
            <div className="product-page__pdp-gallery" id="section-gallery">
              <div className="product-page__image-frame">
                <img src={product.images[currentImageIndex]} alt={product.name} />

                {product.images.length > 1 ? (
                  <>
                    <button
                      aria-label="이전 이미지"
                      className="product-page__gallery-button product-page__gallery-button--left"
                      type="button"
                      onClick={() =>
                        setCurrentImageIndex(
                          (previousIndex) =>
                            (previousIndex - 1 + product.images.length) % product.images.length
                        )
                      }
                    >
                      이전
                    </button>
                    <button
                      aria-label="다음 이미지"
                      className="product-page__gallery-button product-page__gallery-button--right"
                      type="button"
                      onClick={() =>
                        setCurrentImageIndex(
                          (previousIndex) => (previousIndex + 1) % product.images.length
                        )
                      }
                    >
                      다음
                    </button>
                  </>
                ) : null}
              </div>

              <div className="product-page__thumbs">
                {product.images.map((image, index) => (
                  <button
                    className={index === currentImageIndex ? "is-active" : ""}
                    key={image}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img loading="lazy" src={image} alt="" />
                  </button>
                ))}
              </div>
            </div>

            <nav
              className="product-page__subnav"
              aria-labelledby={subnavTitleId}
              role="tablist"
            >
              <h2 className="visually-hidden" id={subnavTitleId}>
                섹션 이동
              </h2>
              <button
                className={activeSubnav === SUBNAV_DETAIL ? "is-active" : ""}
                id="subnav-tab-detail"
                role="tab"
                type="button"
                aria-selected={activeSubnav === SUBNAV_DETAIL}
                onClick={() => {
                  setActiveSubnav(SUBNAV_DETAIL);
                  onSubnavClickDetail();
                }}
              >
                상세 정보
              </button>
              {hasRelated ? (
                <button
                  className={activeSubnav === SUBNAV_RELATED ? "is-active" : ""}
                  id="subnav-tab-related"
                  role="tab"
                  type="button"
                  aria-selected={activeSubnav === SUBNAV_RELATED}
                  onClick={() => {
                    setActiveSubnav(SUBNAV_RELATED);
                    scrollToId("section-related");
                  }}
                >
                  관련 상품
                </button>
              ) : null}
            </nav>

            {hasDescription ? (
              <section
                className="product-page__description-strip"
                id="section-description"
                aria-label="상품 설명 이미지"
              >
                <div className="product-page__description-images">
                  {product.descriptionImages.map((item, index) => (
                    <figure
                      key={`description-image-${index}`}
                      className={`product-page__description-image ${
                        item.caption
                          ? `product-page__description-image--caption-${item.captionPosition || "bottom"}`
                          : ""
                      }`.trim()}
                      style={{
                        marginTop: item.marginTop,
                        marginRight: item.marginRight,
                        marginBottom: item.marginBottom,
                        marginLeft: item.marginLeft,
                      }}
                    >
                      <div className="product-page__description-image-frame">
                        <img alt="" loading="lazy" src={item.url} />
                        {item.caption ? (
                          <figcaption
                            className={`product-page__description-caption product-page__description-caption--${item.captionPosition || "bottom"}`}
                          >
                            {item.caption}
                          </figcaption>
                        ) : null}
                      </div>
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            <aside className="product-page__info product-page__info--sticky">
              <div className="product-page__info-head">
                <button
                  className="product-page__back-link"
                  type="button"
                  onClick={() => navigate(-1)}
                >
                  이전으로 돌아가기
                </button>
                {product.isNew ? <span className="product-page__badge">신상품</span> : null}
              </div>
              <h1>{product.name}</h1>
              <p className="product-page__meta-copy product-page__line-meta">
                {product.category2 === "Men"
                  ? "맨"
                  : product.category2 === "Accessories"
                    ? "액세서리"
                    : "우먼"}{" "}
                · {product.category}
              </p>
              <strong className="product-page__price">{formatKrw(product.price)}</strong>
              <p>{product.description}</p>

              <div className="product-page__option">
                <div className="product-page__option-header">
                  <span>색상</span>
                  <span className="product-page__meta-copy">
                    {product.colors.map((color) => color.name).join(" · ")}
                  </span>
                </div>
                <div aria-hidden="true" className="product-page__colors">
                  {product.colors.map((color) => (
                    <span
                      className="product-page__color-swatch"
                      key={color.name}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="product-page__option">
                <div className="product-page__option-header">
                  <span>사이즈</span>
                  <span className="product-page__meta-copy">
                    {selectedSize || "사이즈를 선택해주세요"}
                  </span>
                </div>
                <div className="product-page__sizes">
                  {product.sizes.map((size) => (
                    <button
                      className={selectedSize === size ? "is-active" : ""}
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="product-page__option">
                <div className="product-page__option-header">
                  <span>수량</span>
                </div>
                <div className="cart-qty">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity((current) => current + 1)}>
                    +
                  </button>
                </div>
              </div>

              <button
                className={`product-page__add-button ${
                  showAddedMessage ? "product-page__add-button--success" : ""
                }`}
                disabled={isAddToCartDisabled}
                type="button"
                onClick={handleAddToCart}
              >
                {addToCartButtonLabel}
              </button>
              {isAddToCartDisabled ? (
                <p className="product-page__helper-text">사이즈를 선택하면 장바구니에 담을 수 있습니다.</p>
              ) : null}

              <button
                className="product-page__wishlist-button"
                type="button"
                onClick={() => toggleItem(product)}
              >
                {isInWishlist(product.sku) ? "위시리스트에서 제거" : "위시리스트에 저장"}
              </button>

              <div className="product-page__details">
                <h2>상품 요약</h2>
                <ul>
                  {product.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>

          {hasRelated ? (
            <section className="product-page__related" id="section-related">
              <div className="product-page__related-header">
                <p>함께 보면 좋은 상품</p>
                <h3>{relatedCollectionLabel} 추천 셀렉션</h3>
              </div>

              <div className="product-page__related-grid">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    className="product-page__related-card product-hover-card"
                    key={relatedProduct.sku}
                    to={`/product/${relatedProduct.sku}`}
                  >
                    <div className="product-page__related-media">
                      <ProductImageWithHover
                        alt={relatedProduct.name}
                        hoverImage={relatedProduct.hoverImage}
                        image={relatedProduct.image}
                      />
                    </div>
                    <div>
                      <h4>{relatedProduct.name}</h4>
                      <span>{formatKrw(relatedProduct.price)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

function ProductPage({ user, onLogout }) {
  const { id } = useParams();
  const { getProductById, products } = useProducts();
  const product = getProductById(id);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return getRelatedProducts(products, product);
  }, [product, products]);

  if (!product) {
    return <Navigate replace to="/not-found" />;
  }

  return (
    <ProductPageContent
      key={product.sku}
      product={product}
      relatedProducts={relatedProducts}
      user={user}
      onLogout={onLogout}
    />
  );
}

export default ProductPage;
