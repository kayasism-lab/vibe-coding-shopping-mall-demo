import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useProducts } from "../context/ProductContext";
import { useWishlist } from "../context/WishlistContext";
import { formatKrw } from "../utils/currency";
import "./SearchPage.css";

const recentSearches = ["Wool Coat", "Cashmere", "Leather Bag", "Blouse"];
const popularCategories = [
  { label: "New Arrivals", slug: "new" },
  { label: "Outerwear", slug: "outerwear" },
  { label: "Accessories", slug: "accessories" },
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
  const { fetchProductsPage } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState((searchParams.get("q") || "").trim());
  const [page, setPage] = useState(() => Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1));
  const [pageSize, setPageSize] = useState(
    () => Math.max(1, Number.parseInt(searchParams.get("limit") || "5", 10) || 5)
  );
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { isInWishlist, toggleItem } = useWishlist();
  const hasMountedDebounce = useRef(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => window.clearTimeout(timerId);
  }, [query]);

  useEffect(() => {
    if (hasMountedDebounce.current) {
      setPage(1);
      return;
    }

    hasMountedDebounce.current = true;
  }, [debouncedQuery]);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchParams({});
      return;
    }

    setSearchParams({
      q: debouncedQuery,
      page: String(page),
      limit: String(pageSize),
    });
  }, [debouncedQuery, page, pageSize, setSearchParams]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setTotalResults(0);
      setTotalPages(0);
      setError("");
      return;
    }

    let isActive = true;

    const requestSearchResults = async () => {
      setIsLoading(true);

      try {
        const data = await fetchProductsPage({
          page,
          limit: pageSize,
          query: debouncedQuery,
        });

        if (!isActive) {
          return;
        }

        setResults(data.items);
        setTotalResults(data.total);
        setTotalPages(data.totalPages);
        setError("");

        if (data.page !== page) {
          setPage(data.page);
        }
      } catch (requestError) {
        if (!isActive) {
          return;
        }

        setResults([]);
        setTotalResults(0);
        setTotalPages(0);
        setError(requestError.message || "검색 결과를 불러오지 못했습니다.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void requestSearchResults();

    return () => {
      isActive = false;
    };
  }, [debouncedQuery, fetchProductsPage, page, pageSize]);

  const visiblePages = useMemo(
    () => getVisiblePageNumbers(page, totalPages),
    [page, totalPages]
  );

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="search-page">
        <section className="search-page__hero">
          <p>검색</p>
          <h1>원하는 스타일을 빠르게 찾아보세요</h1>
          <span>상품명, 설명, 카테고리를 기준으로 현재 등록된 상품을 검색할 수 있습니다.</span>

          <div className="search-page__searchbar">
            <input
              autoFocus
              placeholder="원하는 상품명이나 검색어를 콤마로 구분해서 복수 조건검색이 가능합니다"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query ? (
              <button className="search-page__clear" type="button" onClick={() => setQuery("")}>
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

            {error ? <p className="search-page__error">{error}</p> : null}

            {isLoading ? (
              <section className="search-page__empty">
                <h2>검색 결과를 불러오는 중입니다.</h2>
                <p>최신 등록 상품 기준으로 페이지를 계산하고 있습니다.</p>
              </section>
            ) : null}

            {!isLoading && results.length > 0 ? (
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
                      <Link to={`/product/${product.sku}`}>
                        <img alt={product.name} loading="lazy" src={product.image} />
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

            {!isLoading && results.length === 0 ? (
              <section className="search-page__empty">
                <h2>검색 결과가 없습니다.</h2>
                <p>다른 검색어를 시도하거나 신상품 카테고리로 이동해보세요.</p>
                <Link to="/category/new">신상품 보러가기</Link>
              </section>
            ) : null}

            {!isLoading && totalPages > 1 ? (
              <nav className="search-page__pagination" aria-label="검색 결과 페이지 이동">
                <button disabled={page === 1} type="button" onClick={() => setPage((currentPage) => currentPage - 1)}>
                  이전
                </button>
                {visiblePages.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={pageNumber === page ? "is-active" : ""}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  disabled={page === totalPages}
                  type="button"
                  onClick={() => setPage((currentPage) => currentPage + 1)}
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
                  <button key={term} type="button" onClick={() => setQuery(term)}>
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
