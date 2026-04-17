export const editorialHomeOrder = [
  "minimalism-of-light",
  "spring-lookbook",
  "behind-the-story",
];

export const fallbackEditorials = [
  {
    _id: "fallback-minimalism-of-light",
    slug: "minimalism-of-light",
    title: "미니멀리즘의 미학",
    label: "에디토리얼",
    subtitle: "절제된 소재와 조용한 실루엣으로 완성한 시즌 무드",
    format: "manifesto",
    status: "published",
    heroImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2564&auto=format&fit=crop",
    heroImageAlt: "모노톤 스타일의 여성 에디토리얼 이미지",
    intro:
      "절제된 소재와 깊이 있는 실루엣으로 완성한 비주얼 스토리. 과하지 않은 구조와 사진의 여백이 브랜드의 태도를 설명합니다.",
    eventBlocks: [
      {
        eyebrow: "Edit 01",
        title: "Quiet Structure",
        copy: "정제된 어깨선과 긴 호흡의 코트 실루엣으로 첫 인상을 설계합니다.",
        image:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2574&auto=format&fit=crop",
        imageAlt: "코트 중심의 미니멀 에디토리얼 컷",
        ctaLabel: "",
        ctaHref: "",
        alignment: "left",
      },
      {
        eyebrow: "Material",
        title: "Surface Before Detail",
        copy: "과한 장식 대신 소재의 결로 시각적 깊이를 만듭니다.",
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop",
        imageAlt: "소재감을 강조한 에디토리얼 컷",
        ctaLabel: "",
        ctaHref: "",
        alignment: "center",
      },
    ],
    closingCtaLabel: "스토어 메인으로 돌아가기",
    closingCtaHref: "/",
    relatedProductSkus: [1, 3, 5],
    manifestoSections: [
      {
        heading: "Quiet Structure",
        body: "실루엣은 단정하지만 경직되지 않게, 무채색 팔레트 안에서도 소재 차이로 리듬이 생기도록 구성했습니다.",
        image:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2574&auto=format&fit=crop",
        imageAlt: "미니멀한 코트 스타일링",
      },
    ],
    looks: [],
    processSections: [],
    galleryImages: [],
  },
  {
    _id: "fallback-spring-lookbook",
    slug: "spring-lookbook",
    title: "봄 룩북",
    label: "룩북",
    subtitle: "가벼운 층과 부드러운 색감으로 완성한 일상 스타일링",
    format: "lookbook",
    status: "published",
    heroImage:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2670&auto=format&fit=crop",
    heroImageAlt: "봄 룩북 메인 이미지",
    intro: "가볍게 걸칠 수 있는 레이어와 정돈된 실루엣을 기준으로 봄의 리듬을 구성했습니다.",
    eventBlocks: [
      {
        eyebrow: "Look 01",
        title: "Layered Start",
        copy: "실크 블라우스와 팬츠로 시작하는 가벼운 출근 룩.",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2640&auto=format&fit=crop",
        imageAlt: "블라우스와 팬츠 스타일링",
        ctaLabel: "룩 보기",
        ctaHref: "/product/3",
        alignment: "left",
      },
      {
        eyebrow: "Look 02",
        title: "Refined Balance",
        copy: "부드러운 톤과 정리된 실루엣의 중앙 리듬.",
        image:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2574&auto=format&fit=crop",
        imageAlt: "중앙 정렬 이벤트 이미지",
        ctaLabel: "",
        ctaHref: "",
        alignment: "center",
      },
      {
        eyebrow: "Look 03",
        title: "Weekend Ease",
        copy: "가벼운 주말 무드로 마무리하는 세 번째 카드.",
        image:
          "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2576&auto=format&fit=crop",
        imageAlt: "린넨 드레스 중심의 주말 룩",
        ctaLabel: "전체 보기",
        ctaHref: "/category/new",
        alignment: "right",
      },
    ],
    closingCtaLabel: "스토어 메인으로 돌아가기",
    closingCtaHref: "/",
    relatedProductSkus: [2, 3, 7],
    manifestoSections: [],
    looks: [
      {
        title: "Morning Layer",
        body: "블라우스와 팬츠 중심의 균형 잡힌 출근 룩.",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2640&auto=format&fit=crop",
        imageAlt: "블라우스와 팬츠 스타일링",
        linkedSkus: [2, 3],
      },
    ],
    processSections: [],
    galleryImages: [],
  },
  {
    _id: "fallback-behind-the-story",
    slug: "behind-the-story",
    title: "비하인드 스토리",
    label: "스튜디오",
    subtitle: "촬영 준비와 셀렉션 구성을 통해 드러나는 브랜드의 작업 방식",
    format: "studio-story",
    status: "published",
    heroImage:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2671&auto=format&fit=crop",
    heroImageAlt: "스튜디오 백스테이지 이미지",
    intro: "촬영 전 제품 선택과 세트 구성, 동선 설계까지 하나의 무드로 이어지는 과정을 담았습니다.",
    eventBlocks: [
      {
        eyebrow: "Studio 01",
        title: "Selection Table",
        copy: "촬영 전 제품과 소재를 다시 정리하는 첫 번째 장면.",
        image:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2574&auto=format&fit=crop",
        imageAlt: "촬영 전 선택 테이블",
        ctaLabel: "",
        ctaHref: "",
        alignment: "left",
      },
      {
        eyebrow: "Studio 02",
        title: "Frame And Flow",
        copy: "동선을 최소화해 피사체와 제품이 자연스럽게 드러나도록 설계합니다.",
        image:
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2573&auto=format&fit=crop",
        imageAlt: "촬영 현장의 프레임 구성",
        ctaLabel: "스토어 메인으로 돌아가기",
        ctaHref: "/",
        alignment: "right",
      },
    ],
    closingCtaLabel: "스토어 메인으로 돌아가기",
    closingCtaHref: "/",
    relatedProductSkus: [1, 4, 8],
    manifestoSections: [],
    looks: [],
    processSections: [
      {
        heading: "Selection Table",
        body: "촬영 전날에는 제품의 소재감과 컬러 밸런스를 다시 확인합니다.",
        image:
          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2574&auto=format&fit=crop",
        imageAlt: "촬영 전 상품 선택 장면",
      },
    ],
    galleryImages: [
      {
        image:
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2573&auto=format&fit=crop",
        alt: "스튜디오 무드 컷",
      },
    ],
  },
];
