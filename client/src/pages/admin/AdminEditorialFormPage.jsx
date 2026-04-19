import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import EditorialEventBlocksEditor from "../../components/admin/editorial/EditorialEventBlocksEditor";
import EditorialFormatEditor from "../../components/admin/editorial/EditorialFormatEditor";
import EditorialHeroFramingField from "../../components/admin/editorial/EditorialHeroFramingField";
import EditorialImageField from "../../components/admin/editorial/EditorialImageField";
import EditorialRelatedProductsField from "../../components/admin/editorial/EditorialRelatedProductsField";
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
import { getCloudinaryEnv, openCloudinaryUploadWidget } from "../../utils/cloudinaryWidget";
import { getEditorialValidationMessage, normalizeEditorialPayload } from "../../utils/editorialForm";
import { formatLastSavedLine } from "../../utils/formatLastSavedLine";
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
  const [existingItem, setExistingItem] = useState(null);
  const [isReady, setIsReady] = useState(!id);
  const [formData, setFormData] = useState(createDefaultEditorialForm());
  const [eventBlocks, setEventBlocks] = useState(defaultSections.eventBlocks);
  const [manifestoSections, setManifestoSections] = useState(defaultSections.manifestoSections);
  const [looks, setLooks] = useState(defaultSections.looks);
  const [processSections, setProcessSections] = useState(defaultSections.processSections);
  const [galleryImages, setGalleryImages] = useState(defaultSections.galleryImages);
  const [lastSavedLine, setLastSavedLine] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [cloudinaryBusy, setCloudinaryBusy] = useState(false);
  const [cloudinaryError, setCloudinaryError] = useState("");
  const isEditing = Boolean(id);
  const cloudinaryEnv = getCloudinaryEnv();

  useEffect(() => {
    if (!id) {
      setLastSavedLine("");
      return;
    }
    const raw = sessionStorage.getItem(`editorial-last-saved-${id}`);
    if (raw) {
      sessionStorage.removeItem(`editorial-last-saved-${id}`);
      setLastSavedLine(formatLastSavedLine(new Date(Number(raw))));
    } else {
      setLastSavedLine("");
    }
  }, [id]);

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
          heroImagePosX: target.heroImagePosX ?? 50,
          heroImagePosY: target.heroImagePosY ?? 50,
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
    setSubmitError("");
    try {
      if (isEditing) {
        await updateEditorial(id, payload);
        setLastSavedLine(formatLastSavedLine(new Date()));
      } else {
        const created = await createEditorial(payload);
        const newId = created._id;
        sessionStorage.setItem(`editorial-last-saved-${newId}`, String(Date.now()));
        navigate(`/admin/editorials/${newId}/edit`, { replace: true });
      }
    } catch (saveError) {
      setSubmitError(saveError instanceof Error ? saveError.message : "저장에 실패했습니다.");
    }
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
        <div className="admin-page__form-actions admin-page__form-actions--top">
          <div className="admin-page__form-actions__messages">
            {lastSavedLine ? <p className="admin-page__muted">{lastSavedLine}</p> : null}
            {submitError ? <p className="admin-page__pagination-error">{submitError}</p> : null}
          </div>
          <Link className="admin-page__button--ghost" to="/admin/editorials">취소</Link>
          <button className="admin-page__button" type="submit">{isEditing ? "변경사항 저장" : "에디토리얼 생성"}</button>
        </div>

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
                onChange={(value) =>
                  setFormData((current) => {
                    const next = { ...current, heroImage: value };
                    if (String(value).trim() !== String(current.heroImage).trim()) {
                      next.heroImagePosX = 50;
                      next.heroImagePosY = 50;
                    }
                    return next;
                  })
                }
                onUpload={() =>
                  runCloudinaryUpload((url) =>
                    setFormData((current) => ({
                      ...current,
                      heroImage: url,
                      heroImagePosX: 50,
                      heroImagePosY: 50,
                    }))
                  )
                }
              />
              {String(formData.slug || "")
                .trim()
                .toLowerCase() !== "behind-the-story" ? (
                <div className="admin-page__field" style={{ gridColumn: "1 / -1" }}>
                  <EditorialRelatedProductsField
                    disabled={cloudinaryBusy}
                    label="관련 상품"
                    value={formData.relatedProductSkusText}
                    onChange={(next) => setFormData((current) => ({ ...current, relatedProductSkusText: next }))}
                  />
                </div>
              ) : null}
            </div>

            <div className="admin-page__field" style={{ marginTop: 20 }}>
              <span>히어로 이미지 프레이밍 (드래그)</span>
              <p className="admin-page__muted editorial-hero-framing__hint" style={{ margin: "0 0 10px" }}>
                아래 박스는 상세 페이지 상단 히어로와 비슷한 낮은 배너 비율로 보여 줍니다. 안에서 드래그해 실제에 보일 영역을 맞춥니다.
              </p>
              <EditorialHeroFramingField
                disabled={cloudinaryBusy}
                hint=""
                imageUrl={formData.heroImage}
                posX={formData.heroImagePosX}
                posY={formData.heroImagePosY}
                onChange={({ posX, posY }) =>
                  setFormData((current) => ({ ...current, heroImagePosX: posX, heroImagePosY: posY }))
                }
              />
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

      </form>
    </section>
  );
}

export default AdminEditorialFormPage;
