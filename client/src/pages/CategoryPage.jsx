import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import CartSidebar from "../components/store/CartSidebar";
import StoreFooter from "../components/store/StoreFooter";
import StoreHeader from "../components/store/StoreHeader";
import { useProducts } from "../context/ProductContext";
import {
  categories,
  categoryMeta,
} from "../data/catalog";
import { formatKrw } from "../utils/currency";
import "./CategoryPage.css";

const sortOptions = [
  { value: "newest", label: "최신순" },
  { value: "price-low", label: "가격 낮은순" },
  { value: "price-high", label: "가격 높은순" },
  { value: "name", label: "이름순" },
];

function CategoryPage({ user, onLogout }) {
  const { getProductsByCategorySlug } = useProducts();
  const { slug } = useParams();
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceLimit, setPriceLimit] = useState(2000000);
  const [viewMode, setViewMode] = useState("grid");
  const meta = categoryMeta[slug];

  const availableProducts = getProductsByCategorySlug(slug);

  const filteredProducts = useMemo(() => {
    const nextProducts = [...availableProducts]
      .filter((product) => Number.parseFloat(product.price) <= priceLimit)
      .filter((product) =>
        selectedCategories.length > 0 ? selectedCategories.includes(product.category) : true
      );

    switch (sortBy) {
      case "price-low":
        nextProducts.sort((first, second) => Number(first.price) - Number(second.price));
        break;
      case "price-high":
        nextProducts.sort((first, second) => Number(second.price) - Number(first.price));
        break;
      case "name":
        nextProducts.sort((first, second) => first.name.localeCompare(second.name));
        break;
      default:
        nextProducts.sort((first, second) => Number(second.isNew) - Number(first.isNew));
        break;
    }

    return nextProducts;
  }, [availableProducts, priceLimit, selectedCategories, sortBy]);

  if (!meta) {
    return <Navigate replace to="/not-found" />;
  }

  const categoryFilters = [...new Set(availableProducts.map((product) => product.category))];
  const heroImage =
    categories.find((category) => category.title.toLowerCase() === slug)?.image || categories[0].image;

  const toggleCategory = (categoryName) => {
    setSelectedCategories((currentCategories) =>
      currentCategories.includes(categoryName)
        ? currentCategories.filter((currentCategory) => currentCategory !== categoryName)
        : [...currentCategories, categoryName]
    );
  };

  return (
    <div className="store-shell">
      <StoreHeader user={user} onLogout={onLogout} />
      <CartSidebar />

      <main className="category-page">
        <section className="category-page__hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="category-page__hero-overlay" />
          <div className="category-page__hero-content">
            <p>컬렉션</p>
            <h1>{meta.title}</h1>
            <span>{meta.description}</span>
          </div>
        </section>

        <section className="category-page__body">
          <aside className="category-page__filters">
            <div className="category-page__filter-group">
              <h2>카테고리</h2>
              {categoryFilters.map((categoryName) => (
                <label key={categoryName}>
                  <input
                    checked={selectedCategories.includes(categoryName)}
                    type="checkbox"
                    onChange={() => toggleCategory(categoryName)}
                  />
                  <span>{categoryName}</span>
                </label>
              ))}
            </div>

            <div className="category-page__filter-group">
              <h2>최대 가격</h2>
              <input
                max="2000000"
                min="0"
                step="10000"
                type="range"
                value={priceLimit}
                onChange={(event) => setPriceLimit(Number(event.target.value))}
              />
              <strong>{formatKrw(priceLimit)}</strong>
            </div>

            <button
              className="category-page__clear"
              type="button"
              onClick={() => {
                setSelectedCategories([]);
                setPriceLimit(2000000);
              }}
            >
              필터 초기화
            </button>
          </aside>

          <div className="category-page__content">
            <div className="category-page__toolbar">
              <div>
                <strong>{filteredProducts.length}</strong>
                <span className="category-page__toolbar-link">개 상품</span>
              </div>

              <div className="category-page__toolbar-actions">
                <button
                  className={`category-page__view-button ${
                    viewMode === "grid" ? "is-active" : ""
                  }`}
                  type="button"
                  onClick={() => setViewMode("grid")}
                >
                  그리드
                </button>
                <button
                  className={`category-page__view-button ${
                    viewMode === "list" ? "is-active" : ""
                  }`}
                  type="button"
                  onClick={() => setViewMode("list")}
                >
                  리스트
                </button>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div
                className={`category-page__products ${
                  viewMode === "list" ? "category-page__products--list" : ""
                }`}
              >
                {filteredProducts.map((product) => (
                  <Link className="category-page__card" key={product.sku} to={`/product/${product.sku}`}>
                    <img loading="lazy" src={product.image} alt={product.name} />
                    <div>
                      <span>{product.category}</span>
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <strong>{formatKrw(product.price)}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="category-page__empty">
                <p>선택한 조건에 맞는 상품이 없습니다.</p>
                <button
                  className="category-page__clear"
                  type="button"
                  onClick={() => {
                    setSelectedCategories([]);
                    setPriceLimit(2000000);
                  }}
                >
                  다시 보기
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}

export default CategoryPage;
