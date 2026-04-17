import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useEditorials } from "../context/EditorialContext";
import { useProducts } from "../context/ProductContext";
import "./EditorialPage.css";

const getRelatedProducts = (products, relatedSkus) =>
  relatedSkus
    .map((sku) => products.find((product) => product.sku === sku))
    .filter(Boolean);

const shouldRenderEventBlockCta = (editorialSlug, block) => {
  // Keep this guard until older seeded editorial records no longer carry the legacy CTA.
  if (editorialSlug === "minimalism-of-light" && block.eyebrow === "Edit 01") {
    return false;
  }

  return Boolean(block.ctaLabel && block.ctaHref);
};

function EditorialPage({ user, onLogout }) {
  const { slug } = useParams();
  const { getEditorialBySlug, isLoading } = useEditorials();
  const { products } = useProducts();
  const editorial = getEditorialBySlug(slug);

  if (!editorial && isLoading) {
    return <main className="editorial-page__loading">에디토리얼을 불러오는 중입니다.</main>;
  }

  if (!editorial) {
    return <Navigate replace to="/not-found" />;
  }

  const relatedProducts = getRelatedProducts(products, editorial.relatedProductSkus);

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="editorial-page">
        <section
          className="editorial-hero"
          style={{
            backgroundImage: `linear-gradient(rgba(17,24,39,0.22), rgba(17,24,39,0.28)), url(${editorial.heroImage})`,
          }}
        >
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
