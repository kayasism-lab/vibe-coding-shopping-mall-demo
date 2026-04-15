import { useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
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
  const [selectedSizes, setSelectedSizes] = useState(() => product?.sizes || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
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
      return { field: "imageList-0", message: "이미지 목록을 한 개 이상 입력해주세요." };
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

  const handleDelete = async () => {
    if (!product) {
      return;
    }

    try {
      setSubmitError("");
      await deleteProduct(product.sku);
      navigate("/admin/products");
    } catch (error) {
      setSubmitError(error.message || "상품 삭제에 실패했습니다.");
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
            <h2>상세 정보</h2>
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
            <h2>이미지 목록</h2>
            <button
              className="admin-page__button--ghost"
              type="button"
              onClick={() => setImageRows((rows) => [...rows, { id: newRowId(), url: "" }])}
            >
              이미지 URL 추가
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

        <div className="admin-page__form-actions">
          {submitError ? <p className="admin-page__muted">{submitError}</p> : null}
          {isEditing ? (
            <button className="admin-page__button--danger" type="button" onClick={handleDelete}>
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
      </form>
    </section>
  );
}

export default AdminProductFormPage;
