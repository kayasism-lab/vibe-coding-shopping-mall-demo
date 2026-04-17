import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import EditorialEventBlocksEditor from "../../components/admin/editorial/EditorialEventBlocksEditor";
import EditorialFormatEditor from "../../components/admin/editorial/EditorialFormatEditor";
import EditorialImageField from "../../components/admin/editorial/EditorialImageField";
import {
  createDefaultEditorialForm,
  createEventBlock,
  createGalleryImage,
  createLook,
  createManifestoSection,
  createProcessSection,
  editorialFormatOptions,
} from "../../data/editorialFormats";
import { useEditorials } from "../../context/EditorialContext";
import { useProducts } from "../../context/ProductContext";
import { getCloudinaryEnv, openCloudinaryUploadWidget } from "../../utils/cloudinaryWidget";
import { getEditorialValidationMessage, normalizeEditorialPayload } from "../../utils/editorialForm";
import "./AdminPages.css";

const defaultSections = {
  eventBlocks: [createEventBlock()],
  manifestoSections: [createManifestoSection()],
  looks: [createLook()],
  processSections: [createProcessSection()],
  galleryImages: [createGalleryImage()],
};

function AdminEditorialFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createEditorial, fetchAdminEditorials, updateEditorial } = useEditorials();
  const { products } = useProducts();
  const [existingItem, setExistingItem] = useState(null);
  const [isReady, setIsReady] = useState(!id);
  const [formData, setFormData] = useState(createDefaultEditorialForm());
  const [eventBlocks, setEventBlocks] = useState(defaultSections.eventBlocks);
  const [manifestoSections, setManifestoSections] = useState(defaultSections.manifestoSections);
  const [looks, setLooks] = useState(defaultSections.looks);
  const [processSections, setProcessSections] = useState(defaultSections.processSections);
  const [galleryImages, setGalleryImages] = useState(defaultSections.galleryImages);
  const [submitError, setSubmitError] = useState("");
  const [cloudinaryBusy, setCloudinaryBusy] = useState(false);
  const [cloudinaryError, setCloudinaryError] = useState("");
  const isEditing = Boolean(id);
  const cloudinaryEnv = getCloudinaryEnv();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const items = await fetchAdminEditorials();
        const target = items.find((item) => item._id === id);
        if (!target) {
          setIsReady(true);
          return;
        }
        setExistingItem(target);
        setFormData({
          slug: target.slug,
          title: target.title,
          label: target.label,
          subtitle: target.subtitle,
          format: target.format,
          status: target.status,
          heroImage: target.heroImage,
          heroImageAlt: target.heroImageAlt,
          intro: target.intro,
          closingCtaLabel: target.closingCtaLabel,
          closingCtaHref: target.closingCtaHref,
          relatedProductSkusText: target.relatedProductSkus.join(", "),
        });
        setEventBlocks(target.eventBlocks.length > 0 ? target.eventBlocks : defaultSections.eventBlocks);
        setManifestoSections(target.manifestoSections.length > 0 ? target.manifestoSections : defaultSections.manifestoSections);
        setLooks(target.looks.length > 0 ? target.looks.map((item) => ({ ...item, linkedSkusText: item.linkedSkus.join(", ") })) : defaultSections.looks);
        setProcessSections(target.processSections.length > 0 ? target.processSections : defaultSections.processSections);
        setGalleryImages(target.galleryImages.length > 0 ? target.galleryImages : defaultSections.galleryImages);
      } finally {
        setIsReady(true);
      }
    };
    void load();
  }, [fetchAdminEditorials, id]);

  const productSkuHelp = useMemo(() => products.map((product) => `${product.sku}:${product.name}`).join(" / "), [products]);

  const runCloudinaryUpload = async (applyUrl) => {
    if (!cloudinaryEnv.ready) {
      window.alert("Cloudinary 환경 변수를 먼저 설정해주세요.");
      return;
    }
    setCloudinaryError("");
    setCloudinaryBusy(true);
    try {
      await openCloudinaryUploadWidget({
        onSuccess: (url) => applyUrl(url),
        onError: (message) => setCloudinaryError(message),
      });
    } catch (error) {
      setCloudinaryError(error instanceof Error ? error.message : "Cloudinary 위젯을 불러오지 못했습니다.");
    } finally {
      setCloudinaryBusy(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = normalizeEditorialPayload({ formData, eventBlocks, manifestoSections, looks, processSections, galleryImages });
    const validationMessage = getEditorialValidationMessage(payload);
    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }
    if (isEditing) await updateEditorial(id, payload);
    else await createEditorial(payload);
    navigate("/admin/editorials");
  };

  if (isEditing && isReady && !existingItem) return <Navigate replace to="/not-found" />;
  if (!isReady) return <section className="admin-page"><div className="admin-page__empty"><h3>불러오는 중입니다.</h3></div></section>;

  return (
    <section className="admin-page">
      <header className="admin-page__header admin-page__header--compact">
        <div>
          <div className="admin-page__breadcrumbs"><Link to="/admin/editorials">에디토리얼</Link><span>/</span><span>{isEditing ? "수정" : "신규 등록"}</span></div>
          <h1 className="admin-page__title">{isEditing ? "에디토리얼 수정" : "에디토리얼 등록"}</h1>
        </div>
        <Link className="admin-page__button--ghost" to="/admin/editorials">목록으로</Link>
      </header>

      <form className="admin-page__form" onSubmit={handleSubmit}>
        <section className="admin-page__form-section">
          <div className="admin-page__section-header admin-page__section-header--form">
            <div>
              <h2>기본 정보</h2>
              <p className="admin-page__muted">홈 카드와 상세 상단에 실제로 보이는 내용만 수정합니다.</p>
            </div>
          </div>
          <div className="admin-page__form-body">
            <div className="admin-page__form-grid">
              {["slug", "label", "title", "subtitle"].map((field) => (
                <label className="admin-page__field" key={field}>
                  <span>{field}</span>
                  <input className="admin-page__input" type="text" value={formData[field]} onChange={(event) => setFormData((current) => ({ ...current, [field]: event.target.value }))} />
                </label>
              ))}
              <label className="admin-page__field">
                <span>format</span>
                <select className="admin-page__select" value={formData.format} onChange={(event) => setFormData((current) => ({ ...current, format: event.target.value }))}>
                  {editorialFormatOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="admin-page__field">
                <span>status</span>
                <select className="admin-page__select" value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </select>
              </label>
            </div>

            <div className="admin-page__form-grid" style={{ marginTop: 16 }}>
              <EditorialImageField
                disabled={cloudinaryBusy}
                label="hero image"
                previewAlt="에디토리얼 대표 이미지 미리보기"
                required
                value={formData.heroImage}
                onChange={(value) => setFormData((current) => ({ ...current, heroImage: value }))}
                onUpload={() => runCloudinaryUpload((url) => setFormData((current) => ({ ...current, heroImage: url })))}
              />
              <label className="admin-page__field">
                <span>related product skus</span>
                <input className="admin-page__input" placeholder="예: 1, 3, 5" type="text" value={formData.relatedProductSkusText} onChange={(event) => setFormData((current) => ({ ...current, relatedProductSkusText: event.target.value }))} />
                <p className="admin-page__muted">{productSkuHelp}</p>
              </label>
            </div>

            <label className="admin-page__field" style={{ marginTop: 16 }}>
              <span>intro</span>
              <textarea className="admin-page__textarea" rows="5" value={formData.intro} onChange={(event) => setFormData((current) => ({ ...current, intro: event.target.value }))} />
            </label>

            <p className="admin-page__muted" style={{ margin: "16px 0 0" }}>
              {cloudinaryEnv.ready ? "Cloudinary 업로드를 사용하면 URL 입력과 미리보기가 함께 갱신됩니다." : "Cloudinary로 바로 올리려면 .env에 VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET을 설정하세요."}
            </p>
            {cloudinaryError ? <p className="admin-page__pagination-error">{cloudinaryError}</p> : null}
          </div>
        </section>

        <EditorialEventBlocksEditor
          cloudinaryBusy={cloudinaryBusy}
          eventBlocks={eventBlocks}
          setEventBlocks={setEventBlocks}
          onAddBlock={() => setEventBlocks((current) => [...current, createEventBlock()])}
          onUploadImage={runCloudinaryUpload}
        />

        <EditorialFormatEditor
          cloudinaryBusy={cloudinaryBusy}
          format={formData.format}
          galleryImages={galleryImages}
          looks={looks}
          manifestoSections={manifestoSections}
          processSections={processSections}
          productSkuHelp={productSkuHelp}
          setGalleryImages={setGalleryImages}
          setLooks={setLooks}
          setManifestoSections={setManifestoSections}
          setProcessSections={setProcessSections}
          onAddGallery={() => setGalleryImages((current) => [...current, createGalleryImage()])}
          onAddLook={() => setLooks((current) => [...current, createLook()])}
          onAddManifesto={() => setManifestoSections((current) => [...current, createManifestoSection()])}
          onAddProcess={() => setProcessSections((current) => [...current, createProcessSection()])}
          onUploadImage={runCloudinaryUpload}
        />

        <div className="admin-page__form-actions">
          {submitError ? <p className="admin-page__muted">{submitError}</p> : null}
          <Link className="admin-page__button--ghost" to="/admin/editorials">취소</Link>
          <button className="admin-page__button" type="submit">{isEditing ? "변경사항 저장" : "에디토리얼 생성"}</button>
        </div>
      </form>
    </section>
  );
}

export default AdminEditorialFormPage;
