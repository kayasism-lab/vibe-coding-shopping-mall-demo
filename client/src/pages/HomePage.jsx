import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import ProductImageWithHover from "../components/store/ProductImageWithHover";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useEditorials } from "../context/EditorialContext";
import { useProducts } from "../context/ProductContext";
import { categories, heroSlides } from "../data/catalog";
import { formatKrw } from "../utils/currency";
import { refreshStoredSession } from "../utils/auth";
import "./HomePage.css";

const HOME_SELECTION_LIMIT = 4;
const HOME_SELECTION_ROTATION_MS = 5000;

const sortMainSelectionProducts = (items) =>
  [...items].sort((first, second) => {
    const firstOrder = Number.isInteger(first.mainSelectionOrder)
      ? first.mainSelectionOrder
      : Number.MAX_SAFE_INTEGER;
    const secondOrder = Number.isInteger(second.mainSelectionOrder)
      ? second.mainSelectionOrder
      : Number.MAX_SAFE_INTEGER;

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    return first.sku - second.sku;
  });

const getHomeSelectionProducts = (items) => {
  const selectedProducts = sortMainSelectionProducts(
    items.filter((product) => Number.isInteger(product.mainSelectionOrder))
  );

  if (selectedProducts.length > 0) {
    return selectedProducts;
  }

  return sortMainSelectionProducts(items.slice(0, HOME_SELECTION_LIMIT)).map((product, index) => ({
    ...product,
    mainSelectionOrder: index + 1,
  }));
};

const getStandardProducts = (items, featuredIndex) => {
  if (items.length <= 1) {
    return [];
  }

  const standardProducts = [];
  const maxStandardCount = Math.min(HOME_SELECTION_LIMIT - 1, items.length - 1);

  for (let offset = 1; offset < items.length && standardProducts.length < maxStandardCount; offset += 1) {
    standardProducts.push(items[(featuredIndex + offset) % items.length]);
  }

  return standardProducts;
};

function HomePage({ user, onLogout }) {
  const { getHomeEditorials } = useEditorials();
  const { products } = useProducts();
  const [currentUser, setCurrentUser] = useState(user);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSelectionIndex, setCurrentSelectionIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isNewsletterSubmitted, setIsNewsletterSubmitted] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const requestUser = async () => {
      try {
        const refreshedSession = await refreshStoredSession();
        setCurrentUser(refreshedSession?.user || null);
      } catch {
        setCurrentUser(null);
        onLogout?.();
      }
    };

    requestUser();
  }, [user, onLogout]);

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setCurrentSlide((previousSlide) => (previousSlide + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(slideTimer);
  }, []);

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();

    if (!newsletterEmail.trim()) {
      return;
    }

    setIsNewsletterSubmitted(true);
    setNewsletterEmail("");
  };

  const homeSelectionProducts = getHomeSelectionProducts(products);
  const homeEditorials = getHomeEditorials();
  const hasMultipleSelectionProducts = homeSelectionProducts.length > 1;

  useEffect(() => {
    if (homeSelectionProducts.length === 0) {
      setCurrentSelectionIndex(0);
      return;
    }

    setCurrentSelectionIndex((previousIndex) => previousIndex % homeSelectionProducts.length);
  }, [homeSelectionProducts.length]);

  useEffect(() => {
    if (!hasMultipleSelectionProducts) {
      return undefined;
    }

    const selectionTimer = window.setInterval(() => {
      setCurrentSelectionIndex(
        (previousIndex) => (previousIndex + 1) % homeSelectionProducts.length
      );
    }, HOME_SELECTION_ROTATION_MS);

    return () => window.clearInterval(selectionTimer);
  }, [hasMultipleSelectionProducts, homeSelectionProducts.length]);

  const featuredProduct = homeSelectionProducts[currentSelectionIndex] || null;
  const standardProducts = getStandardProducts(homeSelectionProducts, currentSelectionIndex);

  const handleSelectionStep = (direction) => {
    if (!hasMultipleSelectionProducts) {
      return;
    }

    setCurrentSelectionIndex(
      (previousIndex) =>
        (previousIndex + direction + homeSelectionProducts.length) % homeSelectionProducts.length
    );
  };

  return (
    <div className="store-shell home-page">
      <StoreHeader user={currentUser} onLogout={onLogout} />
      <CartSidebar />

      <section className="hero-section">
        <div className="hero-section__slides">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.title}
              className={`hero-section__slide ${
                index === currentSlide ? "hero-section__slide--active" : ""
              }`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
        </div>

        <div className="hero-section__overlay" />

        <div className="hero-section__content">
          <p>{heroSlides[currentSlide].subtitle}</p>
          <h2>{heroSlides[currentSlide].title}</h2>
          <span>{heroSlides[currentSlide].description}</span>

          <div className="hero-section__cta">
            <a className="hero-section__link hero-section__link--primary" href="#products">
              신상품 보기
            </a>
          </div>
        </div>

        <div className="hero-section__controls">
          <button
            type="button"
            aria-label="이전 슬라이드"
            onClick={() =>
              setCurrentSlide(
                (previousSlide) => (previousSlide - 1 + heroSlides.length) % heroSlides.length
              )
            }
          >
            이전
          </button>
          <div className="hero-section__dots">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`${slide.title} 보기`}
                className={index === currentSlide ? "is-active" : ""}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="다음 슬라이드"
            onClick={() => setCurrentSlide((previousSlide) => (previousSlide + 1) % heroSlides.length)}
          >
            다음
          </button>
        </div>
      </section>

      <section className="category-section" id="categories">
        <div className="section-heading">
          <p>Collection</p>
          <h3>Shop by Mood</h3>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              key={category.title}
              className="category-card"
              style={{ backgroundImage: `url(${category.image})` }}
              to={`/category/${category.slug}`}
            >
              <div className="category-card__overlay" />
              <div className="category-card__content">
                <h4>{category.title}</h4>
                <p>{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="product-section" id="products">
        <div className="section-heading section-heading--inline">
          <div>
            <p>Curated Selection</p>
            <h3>Main Selection</h3>
          </div>
          {hasMultipleSelectionProducts ? (
            <div className="product-section__nav" aria-label="메인 셀렉션 탐색">
              <button type="button" onClick={() => handleSelectionStep(-1)}>
                이전
              </button>
              <span>{`${currentSelectionIndex + 1} / ${homeSelectionProducts.length}`}</span>
              <button type="button" onClick={() => handleSelectionStep(1)}>
                다음
              </button>
            </div>
          ) : null}
        </div>

        <div className="product-showcase">
          {featuredProduct ? (
            <Link
              className="product-card product-card--featured product-hover-card"
              to={`/product/${featuredProduct.sku}`}
            >
              <div className="product-card__media">
                <ProductImageWithHover
                  alt={featuredProduct.name}
                  hoverImage={featuredProduct.hoverImage}
                  image={featuredProduct.image}
                />
              </div>

              <div className="product-card__meta">
                <span>{featuredProduct.homeBadge || featuredProduct.category}</span>
              </div>
              <h4 className="product-card__title">{featuredProduct.name}</h4>
              <strong className="product-card__price">{formatKrw(featuredProduct.price)}</strong>
              <p className="product-card__support">
                {featuredProduct.homeSupport || featuredProduct.description}
              </p>
            </Link>
          ) : null}

          <div className="product-grid">
            {standardProducts.map((product) => (
              <Link
                className="product-card product-card--standard product-hover-card"
                key={product.sku}
                to={`/product/${product.sku}`}
              >
                <div className="product-card__media">
                  <ProductImageWithHover
                    alt={product.name}
                    hoverImage={product.hoverImage}
                    image={product.image}
                  />
                </div>

                <div className="product-card__meta">
                  <span>{product.homeBadge || product.category}</span>
                </div>
                <h4 className="product-card__title">{product.name}</h4>
                <strong className="product-card__price">{formatKrw(product.price)}</strong>
                <p className="product-card__support">{product.homeSupport || product.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {homeEditorials.length > 0 ? (
        <section className="editorial-section" id="editorial">
          <Link
            className="editorial-feature"
            style={{ backgroundImage: `url(${homeEditorials[0].heroImage})` }}
            to={`/editorial/${homeEditorials[0].slug}`}
          >
            <div className="editorial-feature__overlay" />
            <div className="editorial-feature__content">
              <p>{homeEditorials[0].label}</p>
              <h3>{homeEditorials[0].title}</h3>
              <span>{homeEditorials[0].subtitle}</span>
            </div>
          </Link>

          <div className="editorial-stack">
            {homeEditorials.slice(1).map((card) => (
              <Link
                key={card.slug}
                className="editorial-stack__item"
                style={{ backgroundImage: `url(${card.heroImage})` }}
                to={`/editorial/${card.slug}`}
              >
                <div className="editorial-feature__overlay" />
                <div className="editorial-stack__content">
                  <p>{card.label}</p>
                  <h4>{card.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="newsletter-section" id="newsletter">
        <div className="section-heading">
          <p>뉴스레터</p>
          <h3>새 컬렉션 소식을 가장 먼저 받아보세요</h3>
        </div>

        {isNewsletterSubmitted ? (
          <div className="newsletter-success">
            구독이 완료되었습니다. 다음 드롭 소식과 에디토리얼 업데이트를 보내드릴게요.
          </div>
        ) : (
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              value={newsletterEmail}
              onChange={(event) => setNewsletterEmail(event.target.value)}
              placeholder="이메일 주소를 입력하세요"
              required
            />
            <button type="submit">구독하기</button>
          </form>
        )}
      </section>
      <StoreFooter />
    </div>
  );
}

export default HomePage;
