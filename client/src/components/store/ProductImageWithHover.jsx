import React from "react";
import "./ProductImageWithHover.css";

/**
 * 상품 카드용 썸네일. hoverImage가 있을 때만 부모에 .product-hover-card가 있으면 호버 시 전환됩니다.
 */
function ProductImageWithHover({ image, hoverImage, alt, className = "" }) {
  return (
    <span className={`product-image-hover ${className}`.trim()}>
      <img className="product-image-hover__main" alt={alt} loading="lazy" src={image} />
      {hoverImage ? (
        <img
          aria-hidden
          alt=""
          className="product-image-hover__alt"
          loading="lazy"
          src={hoverImage}
        />
      ) : null}
    </span>
  );
}

export default ProductImageWithHover;
