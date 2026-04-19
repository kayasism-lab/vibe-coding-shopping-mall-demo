import React, { useId, useMemo, useState } from "react";
import { useProducts } from "../../../context/ProductContext";
import { parseSkuText } from "../../../utils/editorialForm";
import "./EditorialRelatedProductsField.css";

const PRIMARY_CATEGORIES = ["Outerwear", "Tops", "Bottoms", "Dresses", "Knitwear", "Accessories"];
const LINE_CATEGORIES = ["Men", "Women", "Accessories"];

const PRIMARY_LABELS = {
  Outerwear: "아우터",
  Tops: "탑",
  Bottoms: "하의",
  Dresses: "드레스",
  Knitwear: "니트",
  Accessories: "액세서리",
};

const LINE_LABELS = {
  Men: "Men",
  Women: "Women",
  Accessories: "액세서리 라인",
};

function sortProductsNewestFirst(items) {
  return [...items].sort((first, second) => {
    const tb = second.createdAt ? new Date(second.createdAt).getTime() : 0;
    const ta = first.createdAt ? new Date(first.createdAt).getTime() : 0;
    if (tb !== ta) {
      return tb - ta;
    }
    return Number(second.sku) - Number(first.sku);
  });
}

function formatSkusText(skus) {
  return [...skus].sort((a, b) => a - b).join(", ");
}

/**
 * 관련 상품 SKU를 카테고리·라인·검색으로 찾아 체크하는 편집기 (최신 등록순).
 */
export default function EditorialRelatedProductsField({ label, value, onChange, disabled = false }) {
  const fieldId = useId();
  const { products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [primary, setPrimary] = useState("all");
  const [line, setLine] = useState("all");

  const selectedSkus = useMemo(() => parseSkuText(value), [value]);

  const skuToProduct = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(Number(p.sku), p));
    return map;
  }, [products]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = sortProductsNewestFirst(products);

    if (primary !== "all") {
      list = list.filter((p) => p.category === primary);
    }
    if (line !== "all") {
      list = list.filter((p) => p.category2 === line);
    }
    if (q) {
      list = list.filter((p) => {
        const name = String(p.name || "").toLowerCase();
        const desc = String(p.description || "").toLowerCase();
        const skuStr = String(p.sku);
        return skuStr.includes(q) || name.includes(q) || desc.includes(q);
      });
    }
    return list;
  }, [products, primary, line, search]);

  const setSkus = (nextSkus) => {
    onChange(formatSkusText(nextSkus));
  };

  const toggleSku = (sku) => {
    const n = Number(sku);
    if (!Number.isInteger(n) || n < 1) {
      return;
    }
    const set = new Set(selectedSkus);
    if (set.has(n)) {
      set.delete(n);
    } else {
      set.add(n);
    }
    setSkus([...set]);
  };

  const removeSku = (sku) => {
    setSkus(selectedSkus.filter((s) => s !== sku));
  };

  return (
    <div className={`editorial-related-products ${disabled ? "is-disabled" : ""}`}>
      <span className="editorial-related-products__label">{label}</span>

      {selectedSkus.length > 0 ? (
        <div className="editorial-related-products__chips" aria-label="선택된 상품">
          {selectedSkus.map((sku) => {
            const p = skuToProduct.get(sku);
            const title = p ? p.name : "목록에 없음";
            return (
              <span className="editorial-related-products__chip" key={sku}>
                <span>
                  #{sku} {title}
                </span>
                <button
                  disabled={disabled}
                  type="button"
                  onClick={() => removeSku(sku)}
                  aria-label={`SKU ${sku} 제거`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      ) : (
        <p className="editorial-related-products__muted">선택된 상품이 없습니다. 아래 목록에서 체크하세요.</p>
      )}

      <div className="editorial-related-products__filters">
        <label>
          상품 카테고리
          <select
            className="admin-page__select"
            disabled={disabled}
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
          >
            <option value="all">전체</option>
            {PRIMARY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {PRIMARY_LABELS[c] || c}
              </option>
            ))}
          </select>
        </label>
        <label>
          라인 (Men/Women)
          <select
            className="admin-page__select"
            disabled={disabled}
            value={line}
            onChange={(e) => setLine(e.target.value)}
          >
            <option value="all">전체</option>
            {LINE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {LINE_LABELS[c] || c}
              </option>
            ))}
          </select>
        </label>
        <label style={{ flex: "1 1 200px" }}>
          검색 (이름·SKU·설명)
          <input
            className="editorial-related-products__search"
            disabled={disabled}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색…"
            autoComplete="off"
          />
        </label>
      </div>

      {isLoading ? (
        <p className="editorial-related-products__muted">상품 목록을 불러오는 중입니다.</p>
      ) : (
        <div className="editorial-related-products__list-wrap">
          <ul className="editorial-related-products__list">
            {filteredList.map((p) => {
              const sku = Number(p.sku);
              const checked = selectedSkus.includes(sku);
              return (
                <li className="editorial-related-products__row" key={sku}>
                  <input
                    checked={checked}
                    disabled={disabled}
                    id={`${fieldId}-${sku}`}
                    type="checkbox"
                    onChange={() => toggleSku(sku)}
                  />
                  <label className="editorial-related-products__meta" htmlFor={`${fieldId}-${sku}`}>
                    <span className="editorial-related-products__sku">#{sku}</span>
                    <span>{p.name}</span>
                    <span className="editorial-related-products__cats">
                      {p.category} · {p.category2}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          {filteredList.length === 0 ? (
            <p className="editorial-related-products__muted" style={{ padding: "12px 14px", margin: 0 }}>
              조건에 맞는 상품이 없습니다.
            </p>
          ) : null}
        </div>
      )}

      <details className="editorial-related-products__advanced">
        <summary>직접 입력 (콤마로 SKU 번호)</summary>
        <textarea
          className="admin-page__textarea"
          disabled={disabled}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </details>
    </div>
  );
}
