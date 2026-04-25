import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import AdminImageUrlField from "../../components/admin/AdminImageUrlField";
import { getCloudinaryEnv, openCloudinaryUploadWidget } from "../../utils/cloudinaryWidget";
import "./AdminPages.css";

const categoryOptions = ["Outerwear", "Tops", "Bottoms", "Dresses", "Knitwear", "Accessories"];
const category2Options = [
  { value: "Men", label: "맨 (Men)" },
  { value: "Women", label: "우먼 (Women)" },
  { value: "Accessories", label: "액세서리 (Accessories)" },
];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

const newRowId = () =>
  globalThis.crypto?.randomUUID?.() ?? `r-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const createDescriptionImageRow = (item = null) => ({
  id: newRowId(),
  url: item && item.url != null ? String(item.url) : "",
  marginTop: item && item.marginTop != null ? String(item.marginTop) : "0",
  marginRight: item && item.marginRight != null ? String(item.marginRight) : "0",
  marginBottom: item && item.marginBottom != null ? String(item.marginBottom) : "0",
  marginLeft: item && item.marginLeft != null ? String(item.marginLeft) : "0",
  caption: item && item.caption != null ? String(item.caption) : "",
  captionPosition:
    item && item.captionPosition != null && ["top", "center", "bottom"].includes(String(item.captionPosition))
      ? String(item.captionPosition)
      : "bottom",
});

const clampFormMargin = (value) => {
  const n = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(n)) {
    return 0;
  }
  return Math.min(400, Math.max(0, n));
};

const createDefaultForm = () => ({
  name: "",
  price: "",
  category: "",
  category2: "",
  description: "",
  image: "",
  hoverImage: "",
  isNew: true,
});

function AdminProductFormPage() {
  const { id } = useParams();
  const { getProductById } = useProducts();
  const isEditing = Boolean(id);
  const product = isEditing ? getProductById(id) : null;

  if (isEditing && !product) {
    return <Navigate replace to="/not-found" />;
  }

  return <AdminProductFormContent key={id || "new"} isEditing={isEditing} product={product} />;
}

function AdminProductFormContent({ isEditing, product }) {
  const navigate = useNavigate();
  const { createProduct, deleteProduct, products, updateProduct } = useProducts();
  const defaultMainSelectionOrder =
    Math.max(
      0,
      ...products
        .map((item) => item.mainSelectionOrder)
        .filter((value) => Number.isInteger(value))
    ) + 1;
  const [formData, setFormData] = useState(() =>
    product
      ? {
          name: product.name,
          price: product.price,
          category: product.category,
          category2: product.category2 || "Women",
          description: product.description,
          image: product.image,
          hoverImage: product.hoverImage,
          isNew: product.isNew,
          isMainSelection: Number.isInteger(product.mainSelectionOrder),
          mainSelectionOrder: product.mainSelectionOrder ? String(product.mainSelectionOrder) : "",
        }
      : {
          ...createDefaultForm(),
          isMainSelection: false,
          mainSelectionOrder: String(defaultMainSelectionOrder),
        }
  );
  const [detailRows, setDetailRows] = useState(() => {
    if (product?.details?.length) {
      return product.details.map((value) => ({ id: newRowId(), value }));
    }
    return [{ id: newRowId(), value: "" }];
  });
  const [colorRows, setColorRows] = useState(() => {
    if (product?.colors?.length) {
      return product.colors.map((c) => ({ id: newRowId(), name: c.name, hex: c.hex }));
    }
    return [{ id: newRowId(), name: "", hex: "#000000" }];
  });
  const [imageRows, setImageRows] = useState(() => {
    if (product) {
      const urls = product.images?.length ? product.images : [product.image];
      return urls.map((url) => ({ id: newRowId(), url }));
    }
    return [{ id: newRowId(), url: "" }];
  });
  const [descriptionImageRows, setDescriptionImageRows] = useState(() => {
    if (product?.descriptionImages?.length) {
      return product.descriptionImages.map((item) => createDescriptionImageRow(item));
    }
    return [];
  });
  const [selectedSizes, setSelectedSizes] = useState(() => product?.sizes || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cloudinaryBusy, setCloudinaryBusy] = useState(false);
  const [cloudinaryError, setCloudinaryError] = useState("");
  const fieldRefs = useRef({});
  const cloudinaryEnv = getCloudinaryEnv();

  const registerFieldRef = (fieldKey) => (node) => {
    if (node) {
      fieldRefs.current[fieldKey] = node;
    }
  };

  const focusField = (fieldKey) => {
    const targetField = fieldRefs.current[fieldKey];

    if (!targetField) {
      return;
    }

    targetField.scrollIntoView({ behavior: "smooth", block: "center" });
    targetField.focus?.();
    targetField.select?.();
  };

  const toggleSize = (targetSize) => {
    setSelectedSizes((currentSizes) =>
      currentSizes.includes(targetSize)
        ? currentSizes.filter((size) => size !== targetSize)
        : [...currentSizes, targetSize]
    );
  };

  const runCloudinaryUpload = async (applySecureUrl) => {
    if (!cloudinaryEnv.ready) {
      window.alert(
        "client/.env에 VITE_CLOUDINARY_CLOUD_NAME과 VITE_CLOUDINARY_UPLOAD_PRESET을 설정한 뒤 개발 서버를 다시 시작하세요."
      );
      return;
    }

    setCloudinaryError("");
    setCloudinaryBusy(true);
    try {
      await openCloudinaryUploadWidget({
        onSuccess: (url) => {
          applySecureUrl(url);
        },
        onError: (message) => setCloudinaryError(message),
      });
    } catch (err) {
      setCloudinaryError(err instanceof Error ? err.message : "Cloudinary 위젯을 불러오지 못했습니다.");
    } finally {
      setCloudinaryBusy(false);
    }
  };

  const normalizePayload = () => ({
    name: formData.name.trim(),
    price: formData.price,
    category: formData.category,
    category2: formData.category2,
    description: formData.description.trim(),
    details: detailRows.map((row) => row.value.trim()).filter(Boolean),
    image: formData.image.trim(),
    hoverImage: formData.hoverImage.trim(),
    images: imageRows.map((row) => row.url.trim()).filter(Boolean),
    colors: colorRows
      .map((row) => ({ name: row.name.trim(), hex: row.hex.trim() }))
      .filter((row) => row.name && row.hex),
    sizes: selectedSizes,
    isNew: formData.isNew,
    mainSelectionOrder: formData.isMainSelection
      ? Number.parseInt(formData.mainSelectionOrder, 10)
      : null,
    descriptionImages: descriptionImageRows
      .filter((row) => row.url.trim())
      .map((row) => ({
        url: row.url.trim(),
        marginTop: clampFormMargin(row.marginTop),
        marginRight: clampFormMargin(row.marginRight),
        marginBottom: clampFormMargin(row.marginBottom),
        marginLeft: clampFormMargin(row.marginLeft),
        caption: String(row.caption || "")
          .trim()
          .slice(0, 500),
        captionPosition: ["top", "center", "bottom"].includes(row.captionPosition) ? row.captionPosition : "bottom",
      })),
  });

  const validateRequiredFields = () => {
    const normalizedColors = colorRows.filter((row) => row.name.trim() && row.hex.trim());
    const normalizedImages = imageRows.map((row) => row.url.trim()).filter(Boolean);

    if (!formData.name.trim()) {
      return { field: "name", message: "상품명을 입력해주세요." };
    }

    if (!formData.price || Number.isNaN(Number(formData.price))) {
      return { field: "price", message: "올바른 가격을 입력해주세요." };
    }

    if (!formData.category) {
      return { field: "category", message: "카테고리를 선택해주세요." };
    }

    if (!formData.category2) {
      return { field: "category2", message: "카테고리2(맨/우먼/액세서리)를 선택해주세요." };
    }

    if (!formData.image.trim()) {
      return { field: "image", message: "대표 이미지 URL을 입력해주세요." };
    }

    if (!formData.hoverImage.trim()) {
      return { field: "hoverImage", message: "보조 이미지 URL을 입력해주세요." };
    }

    if (normalizedColors.length === 0) {
      return { field: "color-0", message: "색상 정보를 한 개 이상 입력해주세요." };
    }

    if (selectedSizes.length === 0) {
      return { field: "sizes", message: "사이즈를 한 개 이상 선택해주세요." };
    }

    if (normalizedImages.length === 0) {
      return { field: "imageList-0", message: "보조 이미지 목록을 한 개 이상 입력해주세요." };
    }

    if (
      formData.isMainSelection &&
      (!formData.mainSelectionOrder ||
        !Number.isInteger(Number.parseInt(formData.mainSelectionOrder, 10)) ||
        Number.parseInt(formData.mainSelectionOrder, 10) < 1)
    ) {
      return { field: "mainSelectionOrder", message: "메인 셀렉션 순서는 1 이상의 정수를 입력해주세요." };
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    const validationResult = validateRequiredFields();

    if (validationResult) {
      setSubmitError(validationResult.message);
      window.alert(validationResult.message);
      focusField(validationResult.field);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = normalizePayload();

      if (isEditing && product) {
        await updateProduct(product.sku, payload);
      } else {
        await createProduct(payload);
      }

      navigate("/admin/products");
    } catch (error) {
      setSubmitError(error.message || "상품 저장에 실패했습니다.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!product) {
      return;
    }

    setIsDeleting(true);
    setSubmitError("");

    try {
      await deleteProduct(product.sku);
      setShowDeleteConfirm(false);
      navigate("/admin/products");
    } catch (error) {
      setSubmitError(error.message || "상품 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="admin-page">
      <header className="admin-page__header admin-page__header--compact">
        <div>
          <div className="admin-page__breadcrumbs">
            <Link to="/admin/products">상품</Link>
            <span>/</span>
            <span>{isEditing ? "수정" : "신규 등록"}</span>
          </div>
          <h1 className="admin-page__title">{isEditing ? "상품 수정" : "상품 등록"}</h1>
        </div>
        <Link className="admin-page__button--ghost" to="/admin/products">
          목록으로
        </Link>
      </header>

      <form className="admin-page__form" onSubmit={handleSubmit}>
        <div className="admin-page__form-actions admin-page__form-actions--top">
          <div className="admin-page__form-actions__messages">
            {submitError ? <p className="admin-page__pagination-error">{submitError}</p> : null}
          </div>
          {isEditing ? (
            <button
              className="admin-page__button--danger"
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
            >
              삭제
            </button>
          ) : null}
          <Link className="admin-page__button--ghost" to="/admin/products">
            취소
          </Link>
          <button className="admin-page__button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "저장 중..." : isEditing ? "변경사항 저장" : "상품 생성"}
          </button>
        </div>

        <section className="admin-page__form-section">
          <div className="admin-page__section-header admin-page__section-header--form">
            <h2>기본 정보</h2>
          </div>
          <div className="admin-page__form-body">
            <div className="admin-page__form-grid">
              {isEditing && product ? (
                <div className="admin-page__field">
                  <span>SKU</span>
                  <div className="admin-page__input" style={{ opacity: 0.85, cursor: "default" }}>
                    {product.sku}
                  </div>
                </div>
              ) : null}

              <label className="admin-page__field">
                <span>상품명</span>
                <input
                  required
                  ref={registerFieldRef("name")}
                  className="admin-page__input"
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((currentFormData) => ({
                      ...currentFormData,
                      name: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="admin-page__field">
                <span>가격 (원)</span>
                <input
                  required
                  ref={registerFieldRef("price")}
                  className="admin-page__input"
                  min="0"
                  step="1"
                  type="number"
                  value={formData.price}
                  onChange={(event) =>
                    setFormData((currentFormData) => ({
                      ...currentFormData,
                      price: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="admin-page__field">
                <span>카테고리</span>
                <select
                  required
                  ref={registerFieldRef("category")}
                  className="admin-page__select"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData((currentFormData) => ({
                      ...currentFormData,
                      category: event.target.value,
                    }))
                  }
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-page__field">
                <span>카테고리2</span>
                <select
                  required
                  ref={registerFieldRef("category2")}
                  className="admin-page__select"
                  value={formData.category2}
                  onChange={(event) =>
                    setFormData((currentFormData) => ({
                      ...currentFormData,
                      category2: event.target.value,
                    }))
                  }
                >
                  <option value="">맨 / 우먼 / 액세서리 구분</option>
                  {category2Options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-page__field">
                <span>신상품 표시</span>
                <select
                  className="admin-page__select"
                  value={formData.isNew ? "yes" : "no"}
                  onChange={(event) =>
                    setFormData((currentFormData) => ({
                      ...currentFormData,
                      isNew: event.target.value === "yes",
                    }))
                  }
                >
                  <option value="yes">신상품</option>
                  <option value="no">일반 상품</option>
                </select>
              </label>

              <div className="admin-page__field admin-page__field--selection">
                <span>메인 셀렉션</span>
                <label className="admin-page__checkbox-row">
                  <input
                    checked={formData.isMainSelection}
                    type="checkbox"
                    onChange={(event) =>
                      setFormData((currentFormData) => ({
                        ...currentFormData,
                        isMainSelection: event.target.checked,
                        mainSelectionOrder: event.target.checked
                          ? currentFormData.mainSelectionOrder || String(defaultMainSelectionOrder)
                          : "",
                      }))
                    }
                  />
                  <strong>홈 메인 셀렉션에 포함</strong>
                </label>
                {formData.isMainSelection ? (
                  <input
                    ref={registerFieldRef("mainSelectionOrder")}
                    className="admin-page__input"
                    min="1"
                    step="1"
                    type="number"
                    value={formData.mainSelectionOrder}
                    onChange={(event) =>
                      setFormData((currentFormData) => ({
                        ...currentFormData,
                        mainSelectionOrder: event.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="admin-page__muted">체크하면 홈 메인 셀렉션 순서를 지정할 수 있습니다.</p>
                )}
              </div>
            </div>

            <label className="admin-page__field">
              <span>설명</span>
              <textarea
                className="admin-page__textarea"
                rows="5"
                value={formData.description}
                onChange={(event) =>
                  setFormData((currentFormData) => ({
                    ...currentFormData,
                    description: event.target.value,
                  }))
                }
              />
            </label>

            <p className="admin-page__muted" style={{ margin: "4px 0 0" }}>
              {cloudinaryEnv.ready
                ? "Cloudinary 버튼으로 업로드하면 URL이 채워지고 미리보기가 갱신됩니다."
                : "Cloudinary로 바로 올리려면 .env에 VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET을 설정하세요."}
            </p>
            {cloudinaryError ? (
              <p className="admin-page__muted" style={{ margin: "8px 0 0", color: "#b45309" }}>
                {cloudinaryError}
              </p>
            ) : null}

            <div className="admin-page__form-grid">
              <label className="admin-page__field">
                <span>대표 이미지 URL</span>
                <div className="admin-page__field-row">
                  <input
                    required
                    ref={registerFieldRef("image")}
                    className="admin-page__input"
                    style={{ flex: 1, minWidth: 0 }}
                    type="url"
                    value={formData.image}
                    onChange={(event) =>
                      setFormData((currentFormData) => ({
                        ...currentFormData,
                        image: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="admin-page__button--ghost"
                    disabled={cloudinaryBusy}
                    type="button"
                    onClick={() =>
                      runCloudinaryUpload((url) =>
                        setFormData((currentFormData) => ({ ...currentFormData, image: url }))
                      )
                    }
                  >
                    업로드
                  </button>
                </div>
                {formData.image.trim() ? (
                  <img
                    alt="대표 이미지 미리보기"
                    className="admin-page__url-preview"
                    loading="lazy"
                    src={formData.image.trim()}
                  />
                ) : null}
              </label>

              <label className="admin-page__field">
                <span>호버 이미지 URL</span>
                <div className="admin-page__field-row">
                  <input
                    required
                    ref={registerFieldRef("hoverImage")}
                    className="admin-page__input"
                    style={{ flex: 1, minWidth: 0 }}
                    type="url"
                    value={formData.hoverImage}
                    onChange={(event) =>
                      setFormData((currentFormData) => ({
                        ...currentFormData,
                        hoverImage: event.target.value,
                      }))
                    }
                  />
                  <button
                    className="admin-page__button--ghost"
                    disabled={cloudinaryBusy}
                    type="button"
                    onClick={() =>
                      runCloudinaryUpload((url) =>
                        setFormData((currentFormData) => ({ ...currentFormData, hoverImage: url }))
                      )
                    }
                  >
                    업로드
                  </button>
                </div>
                {formData.hoverImage.trim() ? (
                  <img
                    alt="호버 이미지 미리보기"
                    className="admin-page__url-preview"
                    loading="lazy"
                    src={formData.hoverImage.trim()}
                  />
                ) : null}
              </label>
            </div>
          </div>
        </section>

        <section className="admin-page__form-section">
          <div className="admin-page__section-header admin-page__section-header--form">
            <h2>상품 요약</h2>
            <button
              className="admin-page__button--ghost"
              type="button"
              onClick={() => setDetailRows((rows) => [...rows, { id: newRowId(), value: "" }])}
            >
              항목 추가
            </button>
          </div>
          <div className="admin-page__form-body">
            <div className="admin-page__form-grid admin-page__form-grid--single">
              {detailRows.map((row) => (
                <div className="admin-page__detail-row" key={row.id}>
                  <input
                    className="admin-page__input"
                    type="text"
                    value={row.value}
                    onChange={(event) =>
                      setDetailRows((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, value: event.target.value } : r))
                      )
                    }
                  />
                  {detailRows.length > 1 ? (
                    <button
                      className="admin-page__icon-button"
                      type="button"
                      onClick={() => setDetailRows((rows) => rows.filter((r) => r.id !== row.id))}
                    >
                      삭제
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-page__form-section">
          <div className="admin-page__section-header admin-page__section-header--form">
            <h2>색상과 사이즈</h2>
          </div>
          <div className="admin-page__form-body">
            <div className="admin-page__form-grid">
              <div className="admin-page__field">
                <span>색상</span>
                <button
                  className="admin-page__button--ghost"
                  type="button"
                  onClick={() =>
                    setColorRows((rows) => [...rows, { id: newRowId(), name: "", hex: "#000000" }])
                  }
                >
                  색상 추가
                </button>
                {colorRows.map((row, index) => (
                  <div className="admin-page__swatch-row" key={row.id}>
                    <input
                      className="admin-page__swatch"
                      type="color"
                      value={row.hex}
                      onChange={(event) =>
                        setColorRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, hex: event.target.value } : r))
                        )
                      }
                    />
                    <input
                      ref={index === 0 ? registerFieldRef("color-0") : undefined}
                      className="admin-page__input"
                      placeholder="색상명"
                      type="text"
                      value={row.name}
                      onChange={(event) =>
                        setColorRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, name: event.target.value } : r))
                        )
                      }
                    />
                    {colorRows.length > 1 ? (
                      <button
                        className="admin-page__icon-button"
                        type="button"
                        onClick={() => setColorRows((rows) => rows.filter((r) => r.id !== row.id))}
                      >
                        삭제
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="admin-page__field">
                <span>사이즈</span>
                <div className="admin-page__option-grid">
                  {sizeOptions.map((size) => (
                    <button
                      ref={size === sizeOptions[0] ? registerFieldRef("sizes") : undefined}
                      key={size}
                      className={`admin-page__option-chip ${
                        selectedSizes.includes(size) ? "is-active" : ""
                      }`}
                      type="button"
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-page__form-section">
          <div className="admin-page__section-header admin-page__section-header--form">
            <h2>보조 이미지 목록</h2>
            <button
              className="admin-page__button--ghost"
              type="button"
              onClick={() => setImageRows((rows) => [...rows, { id: newRowId(), url: "" }])}
            >
              이미지 추가
            </button>
          </div>
          <div className="admin-page__form-body">
            {imageRows.length > 0 ? (
              <div className="admin-page__image-grid">
                {imageRows.map((row, index) => (
                  <figure className="admin-page__image-card" key={row.id}>
                    {row.url ? (
                      <img alt={`상품 이미지 ${index + 1}`} loading="lazy" src={row.url} />
                    ) : (
                      <div
                        style={{
                          height: "180px",
                          display: "grid",
                          placeItems: "center",
                          color: "#6b7280",
                        }}
                      >
                        미리보기 없음
                      </div>
                    )}
                    <figcaption>
                      <div className="admin-page__field-row">
                        <input
                          ref={index === 0 ? registerFieldRef("imageList-0") : undefined}
                          className="admin-page__input"
                          placeholder="https://..."
                          style={{ flex: 1, minWidth: 0 }}
                          type="url"
                          value={row.url}
                          onChange={(event) =>
                            setImageRows((rows) =>
                              rows.map((r) => (r.id === row.id ? { ...r, url: event.target.value } : r))
                            )
                          }
                        />
                        <button
                          className="admin-page__button--ghost"
                          disabled={cloudinaryBusy}
                          type="button"
                          onClick={() =>
                            runCloudinaryUpload((url) =>
                              setImageRows((rows) =>
                                rows.map((r) => (r.id === row.id ? { ...r, url } : r))
                              )
                            )
                          }
                        >
                          업로드
                        </button>
                      </div>
                      {imageRows.length > 1 ? (
                        <button
                          className="admin-page__icon-button"
                          style={{ marginTop: "10px" }}
                          type="button"
                          onClick={() => setImageRows((rows) => rows.filter((r) => r.id !== row.id))}
                        >
                          제거
                        </button>
                      ) : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="admin-page__muted">등록된 이미지가 없습니다.</p>
            )}
          </div>
        </section>

        <section className="admin-page__form-section">
          <div className="admin-page__section-header admin-page__section-header--form">
            <h2>상품설명 이미지</h2>
            <button
              className="admin-page__button--ghost"
              type="button"
              onClick={() => setDescriptionImageRows((rows) => [...rows, createDescriptionImageRow()])}
            >
              이미지 추가
            </button>
          </div>
          <div className="admin-page__form-body">
            {descriptionImageRows.length === 0 ? (
              <p className="admin-page__muted" style={{ marginTop: 0 }}>
                &quot;이미지 추가&quot;로 복수 이미지를 등록할 수 있습니다. 스토어에서는 갤러리 아래 왼쪽 열에 순서대로
                표시되며, 캡션(선택)은 이미지 위에만 덮어씁니다. Cloudinary 업로드·여백(px)을 지정할 수 있습니다.
              </p>
            ) : null}
            {descriptionImageRows.map((row, index) => (
              <div
                className="admin-page__panel"
                key={row.id}
                style={{ marginBottom: 20, padding: "16px 18px" }}
              >
                <div
                  className="admin-page__section-header admin-page__section-header--plain"
                  style={{ marginBottom: 12 }}
                >
                  <h3 className="admin-page__title" style={{ fontSize: "1rem", margin: 0 }}>
                    이미지 {index + 1}
                  </h3>
                  <button
                    className="admin-page__button admin-page__button--ghost"
                    type="button"
                    onClick={() => setDescriptionImageRows((rows) => rows.filter((r) => r.id !== row.id))}
                  >
                    삭제
                  </button>
                </div>
                <AdminImageUrlField
                  cloudinaryDisabled={!cloudinaryEnv.ready}
                  label="이미지 URL"
                  previewAlt={`상품 설명 이미지 ${index + 1}`}
                  value={row.url}
                  onChange={(url) =>
                    setDescriptionImageRows((rows) =>
                      rows.map((r) => (r.id === row.id ? { ...r, url } : r))
                    )
                  }
                  onCloudinaryClick={() =>
                    runCloudinaryUpload((url) =>
                      setDescriptionImageRows((rows) => rows.map((r) => (r.id === row.id ? { ...r, url } : r)))
                    )
                  }
                />
                <label className="admin-page__field" style={{ marginTop: 12 }}>
                  <span>이미지 위 캡션 (선택, 비우면 표시 안 함)</span>
                  <textarea
                    className="admin-page__input"
                    maxLength={500}
                    rows={2}
                    value={row.caption}
                    onChange={(event) =>
                      setDescriptionImageRows((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, caption: event.target.value } : r))
                      )
                    }
                  />
                </label>
                <label className="admin-page__field" style={{ marginTop: 8 }}>
                  <span>캡션 위치</span>
                  <select
                    className="admin-page__input"
                    value={row.captionPosition}
                    onChange={(event) =>
                      setDescriptionImageRows((rows) =>
                        rows.map((r) => (r.id === row.id ? { ...r, captionPosition: event.target.value } : r))
                      )
                    }
                  >
                    <option value="bottom">하단</option>
                    <option value="center">중앙</option>
                    <option value="top">상단</option>
                  </select>
                </label>
                <div
                  className="admin-page__form-grid"
                  style={{ marginTop: 12, gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
                >
                  <label className="admin-page__field">
                    <span>위 (px)</span>
                    <input
                      className="admin-page__input"
                      inputMode="numeric"
                      min={0}
                      max={400}
                      type="number"
                      value={row.marginTop}
                      onChange={(event) =>
                        setDescriptionImageRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, marginTop: event.target.value } : r))
                        )
                      }
                    />
                  </label>
                  <label className="admin-page__field">
                    <span>오른쪽 (px)</span>
                    <input
                      className="admin-page__input"
                      inputMode="numeric"
                      min={0}
                      max={400}
                      type="number"
                      value={row.marginRight}
                      onChange={(event) =>
                        setDescriptionImageRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, marginRight: event.target.value } : r))
                        )
                      }
                    />
                  </label>
                  <label className="admin-page__field">
                    <span>아래 (px)</span>
                    <input
                      className="admin-page__input"
                      inputMode="numeric"
                      min={0}
                      max={400}
                      type="number"
                      value={row.marginBottom}
                      onChange={(event) =>
                        setDescriptionImageRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, marginBottom: event.target.value } : r))
                        )
                      }
                    />
                  </label>
                  <label className="admin-page__field">
                    <span>왼쪽 (px)</span>
                    <input
                      className="admin-page__input"
                      inputMode="numeric"
                      min={0}
                      max={400}
                      type="number"
                      value={row.marginLeft}
                      onChange={(event) =>
                        setDescriptionImageRows((rows) =>
                          rows.map((r) => (r.id === row.id ? { ...r, marginLeft: event.target.value } : r))
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      </form>

      {showDeleteConfirm && product ? (
        <div
          className="admin-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-product-form-delete-title"
        >
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
                <h2 id="admin-product-form-delete-title">상품을 삭제할까요?</h2>
              </div>
              <button className="admin-modal__close" type="button" onClick={closeDeleteModal}>
                ×
              </button>
            </div>
            <p className="admin-page__subtitle">
              &quot;{product.name}&quot; 상품(SKU: {product.sku})을 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="admin-page__confirm-actions">
              <button className="admin-page__button--ghost" type="button" onClick={closeDeleteModal}>
                취소
              </button>
              <button
                className="admin-page__button--danger"
                disabled={isDeleting}
                type="button"
                onClick={() => void handleConfirmDelete()}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminProductFormPage;
