import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import { formatKrw } from "../../utils/currency";
import "./AdminPages.css";

const PAGE_SIZE_OPTIONS = [2, 5, 10, 20];

const getVisiblePageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => startPage + index);
};

function AdminProductsPage() {
  const { deleteProduct, fetchProductsPage, products } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [pageItems, setPageItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = useMemo(
    () => ["all", ...new Set(products.map((product) => product.category))],
    [products]
  );

  const visiblePages = useMemo(
    () => getVisiblePageNumbers(page, totalPages),
    [page, totalPages]
  );

  const loadProductsPage = useCallback(
    async ({ nextPage = page, nextPageSize = pageSize } = {}) => {
      setIsLoading(true);

      try {
        const data = await fetchProductsPage({
          page: nextPage,
          limit: nextPageSize,
          query: debouncedSearchQuery,
          category: selectedCategory,
        });

        setPageItems(data.items);
        setPage(data.page);
        setPageSize(data.limit);
        setTotalProducts(data.total);
        setTotalPages(data.totalPages);
        setError("");
      } catch (loadError) {
        setPageItems([]);
        setTotalProducts(0);
        setTotalPages(0);
        setError(loadError.message || "상품 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearchQuery, fetchProductsPage, page, pageSize, selectedCategory]
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setPage(1);
    }, 250);

    return () => window.clearTimeout(timerId);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, pageSize]);

  useEffect(() => {
    void loadProductsPage();
  }, [loadProductsPage]);

  useEffect(() => {
    setSelectedProducts((currentProducts) =>
      currentProducts.filter((productId) => pageItems.some((product) => product.sku === productId))
    );
  }, [pageItems]);

  const toggleSelection = (productId) => {
    setSelectedProducts((currentProducts) =>
      currentProducts.includes(productId)
        ? currentProducts.filter((currentId) => currentId !== productId)
        : [...currentProducts, productId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedProducts((currentProducts) =>
      currentProducts.length === pageItems.length
        ? []
        : pageItems.map((product) => product.sku)
    );
  };

  const openSingleDeleteModal = (productId) => {
    const targetProduct = pageItems.find((product) => product.sku === productId);

    if (!targetProduct) {
      return;
    }

    setPendingDelete({
      type: "single",
      productIds: [productId],
      message: `"${targetProduct.name}" 상품을 삭제하시겠습니까?`,
    });
  };

  const openBulkDeleteModal = () => {
    if (selectedProducts.length === 0) {
      return;
    }

    setPendingDelete({
      type: "bulk",
      productIds: [...selectedProducts],
      message: `${selectedProducts.length}개의 제품을 삭제하시겠습니까?`,
    });
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete || pendingDelete.productIds.length === 0) {
      return;
    }

    setIsDeleting(true);

    try {
      await Promise.all(pendingDelete.productIds.map((productId) => deleteProduct(productId)));

      if (pendingDelete.type === "bulk") {
        setSelectedProducts([]);
      }

      const shouldMovePreviousPage =
        pageItems.length === pendingDelete.productIds.length && page > 1;

      setPendingDelete(null);

      if (shouldMovePreviousPage) {
        setPage((currentPage) => currentPage - 1);
        return;
      }

      await loadProductsPage();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">상품 카탈로그</p>
          <h1 className="admin-page__title">상품</h1>
        </div>
        <Link className="admin-page__button" to="/admin/products/new">
          상품 등록
        </Link>
      </header>

      <section className="admin-page__table-card">
        <div className="admin-page__controls">
          <input
            className="admin-page__search"
            placeholder="상품명이나 검색어를 콤마로 구분해 AND 검색"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <select
            className="admin-page__select"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "전체 카테고리" : category}
              </option>
            ))}
          </select>
          <select
            className="admin-page__select"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}개씩 보기
              </option>
            ))}
          </select>
        </div>

        <div className="admin-page__pagination-summary">
          <p className="admin-page__muted">
            현재 페이지당 <strong>{pageSize}개</strong>, 총 <strong>{totalProducts}개</strong> 상품
          </p>
          <div className="admin-page__pagination-summary-actions">
            {error ? <p className="admin-page__pagination-error">{error}</p> : null}
          </div>
        </div>

        {selectedProducts.length > 0 ? (
          <div className="admin-page__bulk-actions">
            <button className="admin-page__button--ghost" type="button">
              {selectedProducts.length}개 선택됨
            </button>
            <button
              className="admin-page__button--danger"
              type="button"
              onClick={openBulkDeleteModal}
            >
              선택한 상품 삭제 ({selectedProducts.length})
            </button>
          </div>
        ) : null}

        <div style={{ overflowX: "auto" }}>
          <table className="admin-page__table admin-page__table--products">
            <thead>
              <tr>
                <th>
                  <input
                    checked={
                      pageItems.length > 0 &&
                      selectedProducts.length === pageItems.length
                    }
                    className="admin-page__checkbox"
                    type="checkbox"
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>상품</th>
                <th>카테고리</th>
                <th>카테고리 2</th>
                <th>가격</th>
                <th>메인 셀렉션</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((product) => (
                <tr key={product.sku}>
                  <td>
                    <input
                      checked={selectedProducts.includes(product.sku)}
                      className="admin-page__checkbox"
                      type="checkbox"
                      onChange={() => toggleSelection(product.sku)}
                    />
                  </td>
                  <td>
                    <div className="admin-page__product-cell">
                      <div className="admin-page__thumb">
                        <img alt={product.name} loading="lazy" src={product.image} />
                      </div>
                      <div>
                        <strong>{product.name}</strong>
                        <small>{` (SKU ${product.sku})`}</small>
                      </div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{product.category2 || "—"}</td>
                  <td>{formatKrw(product.price)}</td>
                  <td>
                    {Number.isInteger(product.mainSelectionOrder) ? (
                      <span className="admin-page__tag admin-page__tag--selection">
                        {`${product.mainSelectionOrder}순위`}
                      </span>
                    ) : (
                      <span className="admin-page__tag">미선정</span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-page__tag ${product.isNew ? "is-new" : ""}`}>
                      {product.isNew ? "신상품" : "판매중"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-page__actions">
                      <Link className="admin-page__icon-button" to={`/product/${product.sku}`}>
                        보기
                      </Link>
                      <Link className="admin-page__icon-button" to={`/admin/products/${product.sku}/edit`}>
                        수정
                      </Link>
                      <button
                        className="admin-page__icon-button"
                        type="button"
                        onClick={() => openSingleDeleteModal(product.sku)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isLoading ? (
          <div className="admin-page__empty">
            <h3>상품 목록을 불러오는 중입니다.</h3>
            <p className="admin-page__muted">최신 등록순 상품과 페이지 정보를 조회하고 있습니다.</p>
          </div>
        ) : null}

        {!isLoading && pageItems.length === 0 ? (
          <div className="admin-page__empty">
            <h3>조건에 맞는 상품이 없습니다.</h3>
            <p className="admin-page__muted">검색어나 카테고리를 변경해 다시 확인해주세요.</p>
          </div>
        ) : null}

        {!isLoading && totalPages > 1 ? (
          <div className="admin-page__pagination">
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
          </div>
        ) : null}
      </section>

      {pendingDelete ? (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <button
            aria-label="삭제 확인 닫기"
            className="admin-modal__backdrop"
            type="button"
            onClick={closeDeleteModal}
          />
          <div className="admin-modal__dialog admin-modal__dialog--confirm">
            <div className="admin-modal__header">
              <div>
                <p className="admin-page__eyebrow">삭제 확인</p>
                <h2 id="delete-dialog-title">삭제 확인</h2>
              </div>
              <button className="admin-modal__close" type="button" onClick={closeDeleteModal}>
                ×
              </button>
            </div>
            <p className="admin-page__subtitle">{pendingDelete.message}</p>
            <div className="admin-page__confirm-actions">
              <button className="admin-page__button--ghost" type="button" onClick={closeDeleteModal}>
                취소
              </button>
              <button className="admin-page__button--danger" disabled={isDeleting} type="button" onClick={() => void confirmDelete()}>
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminProductsPage;
