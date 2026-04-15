/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products as fallbackProducts } from "../data/catalog";
import { PRODUCTS_API_URL, getAuthorizationHeader } from "../utils/auth";

const ProductContext = createContext(null);
const PAGINATED_PRODUCTS_API_URL = `${PRODUCTS_API_URL}/paginated`;

const sortProducts = (items) => [...items].sort((first, second) => first.sku - second.sku);
const sortProductsByNewest = (items) =>
  [...items].sort((first, second) => {
    const secondCreatedAt = second.createdAt ? new Date(second.createdAt).getTime() : Number(second.sku);
    const firstCreatedAt = first.createdAt ? new Date(first.createdAt).getTime() : Number(first.sku);
    return secondCreatedAt - firstCreatedAt;
  });

const normalizeProduct = (product) => {
  const { id: _legacyId, ...rest } = product;
  const parsedMainSelectionOrder =
    product.mainSelectionOrder === null || product.mainSelectionOrder === undefined
      ? null
      : Number.parseInt(product.mainSelectionOrder, 10);

  return {
    ...rest,
    sku: Number(product.sku ?? product.id),
    category2: product.category2 || "Women",
    details: Array.isArray(product.details) ? product.details : [],
    images: Array.isArray(product.images) ? product.images : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    mainSelectionOrder:
      Number.isInteger(parsedMainSelectionOrder) && parsedMainSelectionOrder > 0
        ? parsedMainSelectionOrder
        : null,
  };
};

const getSearchTerms = (value) =>
  String(value || "")
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
const getSearchTermVariants = (term) => {
  const variants = new Set([String(term || "").trim().toLowerCase()]);

  if (variants.has("man") || variants.has("men") || variants.has("male") || variants.has("남자")) {
    variants.add("man");
    variants.add("men");
    variants.add("male");
    variants.add("남자");
  }

  if (
    variants.has("woman") ||
    variants.has("women") ||
    variants.has("female") ||
    variants.has("여자")
  ) {
    variants.add("woman");
    variants.add("women");
    variants.add("female");
    variants.add("여자");
  }

  return [...variants];
};

const buildProductsPageFallback = ({ products, page, limit, query, category }) => {
  const searchTerms = getSearchTerms(query);
  const normalizedCategory = String(category || "").trim();

  const filteredProducts = sortProductsByNewest(products)
    .filter((product) => {
      if (searchTerms.length === 0) {
        return true;
      }

      const searchableValues = [
        product.name,
        product.description,
        product.category,
        product.category2,
      ].map((value) => String(value || "").toLowerCase());

      return searchTerms.every((term) =>
        getSearchTermVariants(term).some((variant) =>
          searchableValues.some((value) => value.includes(variant))
        )
      );
    })
    .filter((product) =>
      normalizedCategory && normalizedCategory.toLowerCase() !== "all"
        ? product.category === normalizedCategory
        : true
    );

  const total = filteredProducts.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const startIndex = (safePage - 1) * limit;

  return {
    items: filteredProducts.slice(startIndex, startIndex + limit),
    page: safePage,
    limit,
    total,
    totalPages,
  };
};

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() => sortProducts(fallbackProducts).map(normalizeProduct));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(PRODUCTS_API_URL);
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.message || "상품 목록을 불러오지 못했습니다.");
      }

      setProducts(sortProducts(data.map(normalizeProduct)));
      setError("");
    } catch (fetchError) {
      setProducts(sortProducts(fallbackProducts).map(normalizeProduct));
      setError(fetchError.message || "상품 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const getProductById = useCallback(
    (id) => products.find((product) => product.sku === Number(id)) || null,
    [products]
  );

  const getProductsByCategorySlug = useCallback(
    (slug) => {
      const normalized = String(slug || "").toLowerCase().trim();

      if (normalized === "new") {
        return products.filter((product) => product.isNew);
      }

      if (normalized === "all") {
        return [...products];
      }

      if (normalized === "women") {
        return products.filter((product) => product.category2 === "Women");
      }

      if (normalized === "men") {
        return products.filter((product) => product.category2 === "Men");
      }

      if (normalized === "accessories") {
        return products.filter((product) => product.category2 === "Accessories");
      }

      return products.filter((product) => product.category.toLowerCase() === normalized);
    },
    [products]
  );

  const requestProductMutation = useCallback(async (url, method, payload) => {
    const authorizationHeader = getAuthorizationHeader();

    if (!authorizationHeader) {
      throw new Error("관리자 인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationHeader,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
      throw new Error(data?.message || "상품 요청 처리에 실패했습니다.");
    }

    return data;
  }, []);

  const createProduct = useCallback(
    async (payload) => {
      const createdProduct = normalizeProduct(
        await requestProductMutation(PRODUCTS_API_URL, "POST", payload)
      );
      setProducts((currentProducts) => sortProducts([...currentProducts, createdProduct]));
      return createdProduct;
    },
    [requestProductMutation]
  );

  const updateProduct = useCallback(
    async (productId, payload) => {
      const updatedProduct = normalizeProduct(
        await requestProductMutation(`${PRODUCTS_API_URL}/${productId}`, "PUT", payload)
      );
      setProducts((currentProducts) =>
        sortProducts(
          currentProducts.map((product) =>
            product.sku === Number(productId) ? updatedProduct : product
          )
        )
      );
      return updatedProduct;
    },
    [requestProductMutation]
  );

  const deleteProduct = useCallback(
    async (productId) => {
      await requestProductMutation(`${PRODUCTS_API_URL}/${productId}`, "DELETE");
      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.sku !== Number(productId))
      );
    },
    [requestProductMutation]
  );

  const fetchProductsPage = useCallback(
    async ({ page = 1, limit = 5, query = "", category = "" } = {}) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (String(query || "").trim()) {
        params.set("q", String(query).trim());
      }

      if (String(category || "").trim() && String(category).trim().toLowerCase() !== "all") {
        params.set("category", String(category).trim());
      }

      try {
        const response = await fetch(`${PAGINATED_PRODUCTS_API_URL}?${params.toString()}`);
        const data = await response.json();

        if (!response.ok || !Array.isArray(data?.items)) {
          throw new Error(data?.message || "상품 페이지를 불러오지 못했습니다.");
        }

        return {
          items: data.items.map(normalizeProduct),
          page: Number(data.page) || 1,
          limit: Number(data.limit) || limit,
          total: Number(data.total) || 0,
          totalPages: Number(data.totalPages) || 0,
        };
      } catch {
        return buildProductsPageFallback({
          products,
          page: Number(page) || 1,
          limit: Number(limit) || 5,
          query,
          category,
        });
      }
    },
    [products]
  );

  const value = useMemo(
    () => ({
      products,
      isLoading,
      error,
      refreshProducts,
      getProductById,
      getProductsByCategorySlug,
      createProduct,
      updateProduct,
      deleteProduct,
      fetchProductsPage,
    }),
    [
      createProduct,
      deleteProduct,
      error,
      fetchProductsPage,
      getProductById,
      getProductsByCategorySlug,
      isLoading,
      products,
      refreshProducts,
      updateProduct,
    ]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }

  return context;
}
