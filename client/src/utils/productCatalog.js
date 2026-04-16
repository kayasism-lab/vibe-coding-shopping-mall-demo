const LOCALIZED_PRODUCT_COPY_BY_SKU = {
  1: {
    name: "오버사이즈 울 코트",
    description:
      "프리미엄 이탈리아 울 소재로 완성한 오버사이즈 코트입니다. 드롭 숄더와 여유로운 실루엣, 싱글 브레스티드 디자인으로 우아한 무드를 더했습니다.",
    details: [
      "이탈리아 울 100%",
      "여유로운 핏",
      "싱글 브레스티드 디자인",
      "전면 포켓 2개",
      "드라이클리닝 전용",
    ],
    homeBadge: "에디터 추천",
    homeSupport: "이탈리아 울 블렌드",
  },
  2: {
    name: "테일러드 트라우저",
    description:
      "하이라이즈 허리선과 스트레이트 레그가 돋보이는 테일러드 팬츠입니다. 고급 울 블렌드 소재로 정제된 드레이프를 완성했습니다.",
    details: [
      "울 70%, 폴리에스터 30%",
      "하이라이즈 웨이스트",
      "스트레이트 레그",
      "사이드 지퍼 여밈",
      "드라이클리닝 권장",
    ],
    homeBadge: "워드로브 코어",
    homeSupport: "구조감 있는 스트레이트 핏",
  },
  3: {
    name: "실크 블렌드 블라우스",
    description:
      "은은한 광택과 섬세한 디테일이 어우러진 실크 블렌드 블라우스입니다. 여유로운 핏으로 데일리부터 포멀한 자리까지 자연스럽게 연출됩니다.",
    details: [
      "실크 70%, 코튼 30%",
      "여유로운 핏",
      "자개 버튼 디테일",
      "프렌치 심 마감",
      "손세탁 권장",
    ],
    homeBadge: "신상품",
    homeSupport: "은은한 광택감",
  },
  4: {
    name: "미니멀 레더 백",
    description:
      "풀그레인 이탈리아 가죽으로 제작한 미니멀 토트백입니다. 넉넉한 수납공간과 깔끔한 실루엣으로 다양한 스타일에 자연스럽게 어울립니다.",
    details: [
      "풀그레인 가죽 100%",
      "내부 지퍼 포켓",
      "마그네틱 클로저",
      "길이 조절 스트랩",
      "마른 천으로 가볍게 관리",
    ],
    homeBadge: "기프트 셀렉션",
    homeSupport: "풀그레인 가죽",
  },
  5: {
    name: "캐시미어 스웨터",
    description:
      "부드러운 촉감이 돋보이는 캐시미어 스웨터입니다. 클래식한 크루넥 디자인으로 단독 착용은 물론 레이어드 스타일링에도 잘 어울립니다.",
    details: [
      "몽골리안 캐시미어 100%",
      "레귤러 핏",
      "크루넥",
      "립 조직 소매와 밑단",
      "찬물 손세탁",
    ],
    homeSupport: "몽골리안 캐시미어",
  },
  6: {
    name: "스트럭처드 블레이저",
    description:
      "구조적인 숄더 라인과 슬림한 실루엣이 돋보이는 싱글 브레스티드 블레이저입니다. 고급 울 블렌드 소재로 세련된 인상을 완성합니다.",
    details: [
      "울 65%, 폴리에스터 35%",
      "슬림 핏",
      "싱글 브레스티드",
      "투 버튼 여밈",
      "드라이클리닝 전용",
    ],
    homeSupport: "정제된 숄더 라인",
  },
  7: {
    name: "린넨 드레스",
    description:
      "편안한 실루엣과 브이넥 라인이 조화를 이루는 린넨 드레스입니다. 사이드 포켓 디테일로 실용성과 우아함을 함께 담았습니다.",
    details: [
      "유럽산 린넨 100%",
      "여유로운 핏",
      "브이넥 라인",
      "사이드 심 포켓",
      "찬물 세탁 가능",
    ],
    homeSupport: "유럽산 린넨",
  },
  8: {
    name: "레더 벨트",
    description:
      "프리미엄 이탈리아 가죽과 브러시드 실버 버클로 완성한 클래식 레더 벨트입니다. 다양한 룩에 손쉽게 매치할 수 있는 에센셜 아이템입니다.",
    details: [
      "이탈리아 가죽 100%",
      "브러시드 실버 버클",
      "폭 3cm",
      "다양한 사이즈 제공",
      "마른 천으로 관리",
    ],
    homeSupport: "이탈리아 가죽",
  },
};

const normalizeValue = (value) => String(value || "").trim().toLowerCase();

export const localizeProduct = (product) => {
  const localizedCopy = LOCALIZED_PRODUCT_COPY_BY_SKU[Number(product?.sku)] || null;

  if (!localizedCopy) {
    return product;
  }

  return {
    ...product,
    ...localizedCopy,
  };
};

export const matchesProductCategory = (product, category) => {
  const normalizedCategory = normalizeValue(category);

  if (!normalizedCategory || normalizedCategory === "all") {
    return true;
  }

  return [product.category, product.category2].some(
    (value) => normalizeValue(value) === normalizedCategory
  );
};

export const getProductsByCategorySlug = (items, slug) => {
  const normalizedSlug = normalizeValue(slug);

  if (normalizedSlug === "new") {
    return items.filter((product) => product.isNew);
  }

  if (normalizedSlug === "all") {
    return [...items];
  }

  if (normalizedSlug === "women") {
    return items.filter((product) => normalizeValue(product.category2) === "women");
  }

  if (normalizedSlug === "men") {
    return items.filter((product) => normalizeValue(product.category2) === "men");
  }

  return items.filter((product) => matchesProductCategory(product, normalizedSlug));
};

export const getCategoryHeroImage = (items, slug) =>
  items.find((category) => category.slug === slug)?.image || items[0]?.image || "";

export const getRelatedProducts = (items, currentProduct) => {
  const sameCollectionProducts = items.filter(
    (product) => product.sku !== currentProduct.sku && product.category2 === currentProduct.category2
  );

  const sameCategoryProducts = sameCollectionProducts.filter(
    (product) => product.category === currentProduct.category
  );
  const otherCollectionProducts = sameCollectionProducts.filter(
    (product) => product.category !== currentProduct.category
  );

  return [...sameCategoryProducts, ...otherCollectionProducts].slice(0, 4);
};
