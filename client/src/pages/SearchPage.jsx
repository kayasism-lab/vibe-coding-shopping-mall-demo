import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import ProductImageWithHover from "../components/store/ProductImageWithHover";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useProducts } from "../context/ProductContext";
import { useWishlist } from "../context/WishlistContext";
import { searchProducts } from "../utils/productSearch";
import { formatKrw } from "../utils/currency";
import "./SearchPage.css";

const recentSearches = ["코트", "캐시미어", "레더", "블라우스"];
const popularCategories = [
  { label: "신상품", slug: "new" },
  { label: "아우터", slug: "outerwear" },
  { label: "액세서리", slug: "accessories" },
];
const PAGE_SIZE_OPTIONS = [2, 5, 10, 20];

const getVisiblePageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => startPage + index);
};

function SearchPage({ user, onLogout }) {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState((searchParams.get("q") || "").trim());
  const [page, setPage] = useState(() => Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1));
  const [pageSize, setPageSize] = useState(
    () => Math.max(1, Number.parseInt(searchParams.get("limit") || "5", 10) || 5)
  );
  const { isInWishlist, toggleItem } = useWishlist();

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => window.clearTimeout(timerId);
  }, [query]);

  const filteredProducts = useMemo(
    () => searchProducts(products, debouncedQuery),
    [debouncedQuery, products]
  );
  const totalResults = filteredProducts.length;
  const totalPages = totalResults === 0 ? 0 : Math.ceil(totalResults / pageSize);
  const currentPage = totalPages > 0 ? Math.min(page, totalPages) : 1;

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchParams({});
      return;
    }

    setSearchParams({
      q: debouncedQuery,
      page: String(currentPage),
      limit: String(pageSize),
    });
  }, [currentPage, debouncedQuery, pageSize, setSearchParams]);

  const results = useMemo(() => {
    if (!debouncedQuery) {
      return [];
    }

    const startIndex = (currentPage - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [currentPage, debouncedQuery, filteredProducts, pageSize]);

  const visiblePages = useMemo(
    () => getVisiblePageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="search-page">
        <section className="search-page__hero">
          <h1>원하는 스타일을 빠르게 찾아보세요</h1>
          <span>상품명, 카테고리, 상품 상세 정보를 포함해 콤마 기준 복수 조건 검색이 가능합니다.</span>

          <div className="search-page__searchbar">
            <input
              autoFocus
              placeholder="예: 우먼, 코트 또는 액세서리, 가죽"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
            {query ? (
              <button
                className="search-page__clear"
                type="button"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
              >
                ×
              </button>
            ) : null}
          </div>
        </section>

        {debouncedQuery ? (
          <>
            <section className="search-page__result-header">
              <div>
                <p>검색 결과</p>
                <h2>
                  "{debouncedQuery}" 검색 결과 {totalResults}건
                </h2>
                <span className="search-page__result-meta">현재 {pageSize}개씩 보고 있습니다.</span>
              </div>
              <select
                className="search-page__page-size"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}개씩 보기
                  </option>
                ))}
              </select>
            </section>

            {results.length > 0 ? (
              <section className="search-page__grid">
                {results.map((product) => (
                  <article className="search-page__card" key={product.sku}>
                    <div className="search-page__media">
                      <button
                        aria-label={isInWishlist(product.sku) ? "위시리스트에서 제거" : "위시리스트에 추가"}
                        className={`search-page__wishlist ${
                          isInWishlist(product.sku) ? "is-active" : ""
                        }`}
                        type="button"
                        onClick={() => toggleItem(product)}
                      >
                        {isInWishlist(product.sku) ? "♥" : "♡"}
                      </button>
                      <Link
                        className="search-page__media-link product-hover-card"
                        to={`/product/${product.sku}`}
                      >
                        <ProductImageWithHover
                          alt={product.name}
                          hoverImage={product.hoverImage}
                          image={product.image}
                        />
                      </Link>
                    </div>

                    <div className="search-page__card-body">
                      <small>{product.category}</small>
                      <Link style={{ color: "inherit", textDecoration: "none" }} to={`/product/${product.sku}`}>
                        <h3>{product.name}</h3>
                      </Link>
                      <p>{product.description}</p>
                      <strong>{formatKrw(product.price)}</strong>
                    </div>
                  </article>
                ))}
              </section>
            ) : null}

            {results.length === 0 ? (
              <section className="search-page__empty">
                <h2>검색 결과가 없습니다.</h2>
                <p>상품명, 카테고리, 상품 상세 정보를 조합해서 다시 검색해보세요.</p>
                <Link to="/category/new">신상품 보러가기</Link>
              </section>
            ) : null}

            {totalPages > 1 ? (
              <nav className="search-page__pagination" aria-label="검색 결과 페이지 이동">
                <button disabled={currentPage === 1} type="button" onClick={() => setPage((value) => value - 1)}>
                  이전
                </button>
                {visiblePages.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={pageNumber === currentPage ? "is-active" : ""}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  type="button"
                  onClick={() => setPage((value) => value + 1)}
                >
                  다음
                </button>
              </nav>
            ) : null}
          </>
        ) : (
          <>
            <section className="search-page__section">
              <p>최근 검색어</p>
              <h2>자주 찾는 키워드</h2>
              <div className="search-page__chips">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      setPage(1);
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>

            <section className="search-page__section">
              <p>인기 카테고리</p>
              <h2>바로 가기</h2>
              <div className="search-page__chips">
                {popularCategories.map((category) => (
                  <Link key={category.slug} to={`/category/${category.slug}`}>
                    {category.label}
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

export default SearchPage;
