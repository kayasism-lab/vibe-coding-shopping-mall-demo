export const heroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2676&auto=format&fit=crop",
    subtitle: "신규 컬렉션",
    title: "2026 봄/여름",
    description: "달빛공방 감성에 맞춘 미니멀 룩과 시즌 시그니처 아이템을 만나보세요.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2670&auto=format&fit=crop",
    subtitle: "에디토리얼",
    title: "변하지 않는 우아함",
    description: "절제된 실루엣과 고급 소재로 완성한 무드 있는 데일리 스타일링.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2640&auto=format&fit=crop",
    subtitle: "에센셜",
    title: "단순함의 미학",
    description: "옷장에 오래 남을 에센셜 제품들을 세련된 큐레이션으로 구성했습니다.",
  },
];

export const categories = [
  {
    title: "Women",
    slug: "women",
    description: "도시적인 실루엣과 부드러운 컬러 조합",
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=2592&auto=format&fit=crop",
  },
  {
    title: "Men",
    slug: "men",
    description: "정제된 테일러링과 모던 클래식",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=2574&auto=format&fit=crop",
  },
  {
    title: "New In",
    slug: "new",
    description: "이번 시즌 새롭게 들어온 셀렉션",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "Accessories",
    slug: "accessories",
    description: "룩의 완성도를 높이는 프리미엄 포인트",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2680&auto=format&fit=crop",
  },
];

export const categoryMeta = {
  women: {
    title: "Women",
    description: "모던한 실루엣과 절제된 컬러의 여성 컬렉션을 만나보세요.",
  },
  men: {
    title: "Men",
    description: "클래식과 미니멀 감성을 조합한 남성 에센셜 큐레이션입니다.",
  },
  accessories: {
    title: "Accessories",
    description: "가방, 벨트, 액세서리로 룩의 완성도를 높여보세요.",
  },
  outerwear: {
    title: "Outerwear",
    description: "계절을 넘나드는 코트와 블레이저 중심의 아우터 셀렉션입니다.",
  },
  new: {
    title: "New Arrivals",
    description: "이번 시즌 새롭게 입고된 아이템만 모아 소개합니다.",
  },
  all: {
    title: "All Products",
    description: "달빛공방이 제안하는 전체 상품 라인업입니다.",
  },
};

export const products = [
  {
    sku: 1,
    name: "Oversized Wool Coat",
    price: "525150",
    description:
      "Crafted from premium Italian wool, this oversized coat features a relaxed silhouette with dropped shoulders and a single-breasted design.",
    details: [
      "100% Italian wool",
      "Relaxed fit",
      "Single-breasted design",
      "Two front pockets",
      "Dry clean only",
    ],
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=2574&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=2574&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=2574&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=2574&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520012218364-3dbe62c99bee?q=80&w=2574&auto=format&fit=crop",
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Camel", hex: "#8b7355" },
      { name: "Cream", hex: "#e8e4de" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: true,
    category: "Outerwear",
    category2: "Women",
    mainSelectionOrder: 1,
    homeBadge: "Editor Pick",
    homeSupport: "Italian wool blend",
  },
  {
    sku: 2,
    name: "Tailored Trousers",
    price: "174150",
    description:
      "Elegant tailored trousers with a high-rise waist and straight leg, made from a premium wool blend for a refined drape.",
    details: [
      "70% Wool, 30% Polyester",
      "High-rise waist",
      "Straight leg",
      "Side zip closure",
      "Dry clean recommended",
    ],
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2680&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=2574&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2680&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=2574&auto=format&fit=crop",
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Charcoal", hex: "#1c1c1c" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: false,
    category: "Bottoms",
    category2: "Men",
    mainSelectionOrder: 2,
    homeBadge: "Wardrobe Core",
    homeSupport: "Structured straight leg",
  },
  {
    sku: 3,
    name: "Silk Blend Blouse",
    price: "120150",
    description:
      "A timeless silk blend blouse with a relaxed fit, subtle sheen, and delicate detailing for an elevated everyday look.",
    details: [
      "70% Silk, 30% Cotton",
      "Relaxed fit",
      "Mother-of-pearl buttons",
      "French seams",
      "Hand wash recommended",
    ],
    image:
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=2574&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=2574&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?q=80&w=2574&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=2574&auto=format&fit=crop",
    ],
    colors: [
      { name: "White", hex: "#ffffff" },
      { name: "Black", hex: "#000000" },
      { name: "Blush", hex: "#e8d4c4" },
    ],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    category: "Tops",
    category2: "Women",
    mainSelectionOrder: 3,
    homeBadge: "New Arrival",
    homeSupport: "Soft sheen finish",
  },
  {
    sku: 4,
    name: "Minimalist Leather Bag",
    price: "336150",
    description:
      "A sophisticated leather tote crafted from full-grain Italian leather with a spacious interior and clean silhouette.",
    details: [
      "100% Full-grain leather",
      "Interior zip pocket",
      "Magnetic closure",
      "Adjustable strap",
      "Wipe clean with damp cloth",
    ],
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2669&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=2535&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2669&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=2535&auto=format&fit=crop",
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Tan", hex: "#8b4513" },
    ],
    sizes: ["One Size"],
    isNew: false,
    category: "Accessories",
    category2: "Accessories",
    mainSelectionOrder: 4,
    homeBadge: "Gift Edit",
    homeSupport: "Full-grain leather",
  },
  {
    sku: 5,
    name: "Cashmere Sweater",
    price: "268650",
    description:
      "Luxuriously soft cashmere sweater with a classic crew neck design that works perfectly on its own or layered.",
    details: [
      "100% Mongolian cashmere",
      "Regular fit",
      "Crew neck",
      "Ribbed cuffs and hem",
      "Hand wash cold",
    ],
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2564&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2610&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2564&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2610&auto=format&fit=crop",
    ],
    colors: [
      { name: "Cream", hex: "#e8e4de" },
      { name: "Black", hex: "#000000" },
      { name: "Camel", hex: "#8b7355" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: true,
    category: "Knitwear",
    category2: "Women",
    mainSelectionOrder: null,
    homeBadge: "",
    homeSupport: "Mongolian cashmere",
  },
  {
    sku: 6,
    name: "Structured Blazer",
    price: "390150",
    description:
      "A sophisticated single-breasted blazer with a structured shoulder and slim silhouette in a premium wool blend.",
    details: [
      "65% Wool, 35% Polyester",
      "Slim fit",
      "Single-breasted",
      "Two-button closure",
      "Dry clean only",
    ],
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2672&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2671&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=2672&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2671&auto=format&fit=crop",
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Charcoal", hex: "#1c1c1c" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: false,
    category: "Outerwear",
    category2: "Men",
    mainSelectionOrder: null,
    homeBadge: "",
    homeSupport: "Sharp shoulder line",
  },
  {
    sku: 7,
    name: "Linen Dress",
    price: "214650",
    description:
      "An effortlessly elegant linen dress with a relaxed silhouette, v-neckline, and side seam pockets.",
    details: [
      "100% European linen",
      "Relaxed fit",
      "V-neckline",
      "Side seam pockets",
      "Machine wash cold",
    ],
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2583&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2576&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2583&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2576&auto=format&fit=crop",
    ],
    colors: [
      { name: "Cream", hex: "#e8e4de" },
      { name: "Black", hex: "#000000" },
    ],
    sizes: ["XS", "S", "M", "L"],
    isNew: false,
    category: "Dresses",
    category2: "Women",
    mainSelectionOrder: null,
    homeBadge: "",
    homeSupport: "European linen",
  },
  {
    sku: 8,
    name: "Leather Belt",
    price: "106650",
    description:
      "A classic leather belt crafted from premium Italian leather with a brushed silver buckle for easy styling.",
    details: [
      "100% Italian leather",
      "Brushed silver buckle",
      "Width: 3cm",
      "Available in multiple sizes",
      "Wipe clean",
    ],
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2574&auto=format&fit=crop",
    hoverImage:
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=2670&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2574&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=2670&auto=format&fit=crop",
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "Tan", hex: "#8b4513" },
    ],
    sizes: ["S", "M", "L"],
    isNew: false,
    category: "Accessories",
    category2: "Accessories",
    mainSelectionOrder: null,
    homeBadge: "",
    homeSupport: "Italian leather",
  },
];

export const editorialCards = [
  {
    title: "미니멀리즘의 미학",
    label: "에디토리얼",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop",
  },
  {
    title: "봄 룩북",
    label: "룩북",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "비하인드 스토리",
    label: "스튜디오",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2671&auto=format&fit=crop",
  },
];

export const footerColumns = [
  {
    title: "도움말",
    links: ["고객센터", "배송 및 반품", "사이즈 가이드", "문의하기"],
  },
  {
    title: "회사 정보",
    links: ["브랜드 소개", "채용", "지속가능성", "보도자료"],
  },
  {
    title: "정책",
    links: ["이용약관", "개인정보처리방침", "쿠키 정책"],
  },
];

export const getProductById = (id) => products.find((product) => product.sku === Number(id));

export const getProductsByCategorySlug = (slug) => {
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
};
