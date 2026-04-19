import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useEditorials } from "../context/EditorialContext";
import { useProducts } from "../context/ProductContext";
import "./EditorialPage.css";
import "./EditorialPageNav.css";

const getRelatedProducts = (products, relatedSkus) => {
  const list = Array.isArray(products) ? products : [];
  const skus = Array.isArray(relatedSkus) ? relatedSkus : [];
  return skus.map((sku) => list.find((product) => product.sku === sku)).filter(Boolean);
};

const shouldRenderEventBlockCta = (editorialSlug, block) => {
  // 기존 시드 데이터에 남아 있을 수 있는 CTA를 화면에서 숨깁니다.
  if (editorialSlug === "minimalism-of-light" && block.eyebrow === "Edit 01") {
    return false;
  }

  return Boolean(block.ctaLabel && block.ctaHref);
};

function EditorialPage({ user, onLogout }) {
  const { slug } = useParams();
  const { getEditorialBySlug, getHomeEditorials, isLoading } = useEditorials();
  const { products } = useProducts();
  const editorial = getEditorialBySlug(slug);

  if (!editorial && isLoading) {
    return <main className="editorial-page__loading">에디토리얼을 불러오는 중입니다.</main>;
  }

  if (!editorial) {
    return <Navigate replace to="/not-found" />;
  }

  const relatedProducts =
    editorial.slug === "behind-the-story"
      ? []
      : getRelatedProducts(products, editorial.relatedProductSkus);
  const otherEditorials = getHomeEditorials().filter((e) => e.slug !== slug);

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="editorial-page">
        <section className="editorial-hero">
          <div
            aria-hidden
            className="editorial-hero__bg"
            style={{
              backgroundImage: `url(${editorial.heroImage})`,
              backgroundPosition: `${editorial.heroImagePosX ?? 50}% ${editorial.heroImagePosY ?? 50}%`,
            }}
          />
          <div aria-hidden className="editorial-hero__shade" />
          <div className="editorial-hero__content">
            <p>{editorial.label}</p>
            <h1>{editorial.title}</h1>
            <span>{editorial.subtitle}</span>
          </div>
        </section>

        <section className="editorial-page__intro">
          <p>{editorial.intro}</p>
        </section>

        {editorial.eventBlocks?.length > 0 ? (
          <section className="editorial-event-grid">
            {editorial.eventBlocks.map((block, index) => (
              <article
                className={`editorial-event-card editorial-event-card--${block.alignment}`}
                key={`${block.title}-${index}`}
              >
                {block.image ? (
                  <img alt={block.imageAlt || block.title} loading="lazy" src={block.image} />
                ) : (
                  <div className="editorial-event-card__placeholder">Visual Pending</div>
                )}
                <div className="editorial-event-card__content">
                  {block.eyebrow ? <p className="editorial-page__eyebrow">{block.eyebrow}</p> : null}
                  <h2>{block.title}</h2>
                  <p>{block.copy}</p>
                  {shouldRenderEventBlockCta(editorial.slug, block) ? (
                    <Link to={block.ctaHref}>{block.ctaLabel}</Link>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {editorial.format === "manifesto" ? (
          <section className="editorial-page__grid">
            {editorial.manifestoSections.map((section) => (
              <article className="editorial-page__card" key={section.heading || section.image}>
                <img alt={section.imageAlt || section.heading} loading="lazy" src={section.image} />
                <div>
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {editorial.format === "lookbook" ? (
          <section className="editorial-page__stack">
            {editorial.looks.map((look) => (
              <article className="editorial-page__look" key={look.title || look.image}>
                <img alt={look.imageAlt || look.title} loading="lazy" src={look.image} />
                <div>
                  <p className="editorial-page__eyebrow">Look</p>
                  <h2>{look.title}</h2>
                  <p>{look.body}</p>
                  <div className="editorial-page__chip-row">
                    {getRelatedProducts(products, look.linkedSkus).map((product) => (
                      <Link key={product.sku} to={`/product/${product.sku}`}>
                        {product.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {editorial.format === "studio-story" ? (
          <>
            <section className="editorial-page__stack">
              {editorial.processSections.map((section) => (
                <article className="editorial-page__look" key={section.heading || section.image}>
                  <img alt={section.imageAlt || section.heading} loading="lazy" src={section.image} />
                  <div>
                    <p className="editorial-page__eyebrow">Studio Note</p>
                    <h2>{section.heading}</h2>
                    <p>{section.body}</p>
                  </div>
                </article>
              ))}
            </section>
            {editorial.galleryImages.length > 0 ? (
              <section className="editorial-page__gallery">
                {editorial.galleryImages.map((image) => (
                  <img key={image.image} alt={image.alt} loading="lazy" src={image.image} />
                ))}
              </section>
            ) : null}
          </>
        ) : null}

        {relatedProducts.length > 0 ? (
          <section className="editorial-page__related">
            <div className="section-heading">
              <p>Related Products</p>
              <h3>스토리와 함께 보는 셀렉션</h3>
            </div>
            <div className="editorial-page__chip-row">
              {relatedProducts.map((product) => (
                <Link key={product.sku} to={`/product/${product.sku}`}>
                  {product.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {otherEditorials.length > 0 ? (
          <section aria-labelledby="editorial-page-nav-heading" className="editorial-page__nav">
            <h2 className="editorial-page__eyebrow editorial-page__nav-heading" id="editorial-page-nav-heading">
              다른 에디토리얼
            </h2>
            <div className="editorial-page__nav-grid">
              {otherEditorials.map((item) => (
                <Link className="editorial-page__nav-card" key={item.slug} to={`/editorial/${item.slug}`}>
                  {item.heroImage ? (
                    <img
                      alt={item.heroImageAlt || item.title}
                      loading="lazy"
                      src={item.heroImage}
                      style={{
                        objectPosition: `${item.heroImagePosX ?? 50}% ${item.heroImagePosY ?? 50}%`,
                      }}
                    />
                  ) : null}
                  <span className="editorial-page__nav-card-body">
                    <span className="editorial-page__eyebrow">{item.label}</span>
                    <span className="editorial-page__nav-card-title">{item.title}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {editorial.closingCtaLabel && editorial.closingCtaHref ? (
          <section className="editorial-page__closing">
            <Link to={editorial.closingCtaHref}>{editorial.closingCtaLabel}</Link>
          </section>
        ) : null}
      </main>

      <StoreFooter />
    </div>
  );
}

export default EditorialPage;
