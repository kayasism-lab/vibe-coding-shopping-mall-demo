export const editorialFormatOptions = [
  { value: "manifesto", label: "Manifesto" },
  { value: "lookbook", label: "Lookbook" },
  { value: "studio-story", label: "Studio Story" },
];

export const createDefaultEditorialForm = (format = "manifesto") => ({
  slug: "",
  title: "",
  label: "",
  subtitle: "",
  format,
  status: "draft",
  heroImage: "",
  heroImageAlt: "",
  heroImagePosX: 50,
  heroImagePosY: 50,
  intro: "",
  closingCtaLabel: "",
  closingCtaHref: "",
  relatedProductSkusText: "",
});

export const createEventBlock = () => ({
  eyebrow: "",
  title: "",
  copy: "",
  image: "",
  imageAlt: "",
  ctaLabel: "",
  ctaHref: "",
  alignment: "left",
});

export const createManifestoSection = () => ({
  heading: "",
  body: "",
  image: "",
  imageAlt: "",
});

export const createLook = () => ({
  title: "",
  body: "",
  image: "",
  imageAlt: "",
  linkedSkusText: "",
});

export const createProcessSection = () => ({
  heading: "",
  body: "",
  image: "",
  imageAlt: "",
});

export const createGalleryImage = () => ({
  image: "",
  alt: "",
});

export const getFormatDescription = (format) => {
  if (format === "lookbook") {
    return "룩 이미지와 연결 상품을 중심으로 구성합니다.";
  }

  if (format === "studio-story") {
    return "프로세스 설명과 갤러리 컷을 중심으로 구성합니다.";
  }

  return "브랜드 태도와 메시지를 설명하는 섹션형 페이지입니다.";
};
