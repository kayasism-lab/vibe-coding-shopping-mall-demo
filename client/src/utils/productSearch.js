const getSearchTerms = (value) =>
  String(value || "")
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);

const synonymGroups = [
  ["man", "men", "male", "남자", "맨"],
  ["woman", "women", "female", "여자", "우먼"],
  ["outerwear", "아우터"],
  ["tops", "top", "상의", "탑"],
  ["bottoms", "bottom", "하의", "팬츠"],
  ["dresses", "dress", "드레스"],
  ["knitwear", "knit", "니트", "니트웨어"],
  ["accessories", "accessory", "액세서리"],
];

const getSearchTermVariants = (term) => {
  const variants = new Set([String(term || "").trim().toLowerCase()]);

  for (const group of synonymGroups) {
    if (group.some((keyword) => variants.has(keyword))) {
      group.forEach((keyword) => variants.add(keyword));
      break;
    }
  }

  return [...variants];
};

export const searchProducts = (products, query) => {
  const searchTerms = getSearchTerms(query);

  if (searchTerms.length === 0) {
    return [];
  }

  return products.filter((product) => {
    const searchableValues = [
      product.name,
      product.description,
      product.category,
      product.category2,
      ...(Array.isArray(product.details) ? product.details : []),
    ].map((value) => String(value || "").toLowerCase());

    return searchTerms.every((term) =>
      getSearchTermVariants(term).some((variant) =>
        searchableValues.some((value) => value.includes(variant))
      )
    );
  });
};
