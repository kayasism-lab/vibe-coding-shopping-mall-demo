import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useEditorials } from "../../context/EditorialContext";
import { useProducts } from "../../context/ProductContext";
import {
  createDefaultEditorialForm,
  createEventBlock,
  createGalleryImage,
  createLook,
  createManifestoSection,
  createProcessSection,
  editorialFormatOptions,
  getFormatDescription,
} from "../../data/editorialFormats";
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
  const cloudinaryEnv = getCloudinaryEnv();
  const isEditing = Boolean(id);

  useEffect(() => {
    if (!id) {
      return;
    }

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
        setManifestoSections(
          target.manifestoSections.length > 0 ? target.manifestoSections : defaultSections.manifestoSections
        );
        setLooks(
          target.looks.length > 0
            ? target.looks.map((item) => ({ ...item, linkedSkusText: item.linkedSkus.join(", ") }))
            : defaultSections.looks
        );
        setProcessSections(
          target.processSections.length > 0 ? target.processSections : defaultSections.processSections
        );
        setGalleryImages(
          target.galleryImages.length > 0 ? target.galleryImages : defaultSections.galleryImages
        );
      } finally {
        setIsReady(true);
      }
    };

    void load();
  }, [fetchAdminEditorials, id]);

  const productSkuHelp = useMemo(
    () => products.map((product) => `${product.sku}:${product.name}`).join(" / "),
    [products]
  );

  if (isEditing && isReady && !existingItem) {
    return <Navigate replace to="/not-found" />;
  }

  const updateListItem = (setter, index, field, value) => {
    setter((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };

  const runCloudinaryUpload = async (applySecureUrl) => {
    if (!cloudinaryEnv.ready) {
      window.alert("Cloudinary 환경 변수를 먼저 설정해주세요.");
      return;
    }

    setCloudinaryError("");
    setCloudinaryBusy(true);
    try {
      await openCloudinaryUploadWidget({
        onSuccess: (url) => applySecureUrl(url),
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

    const payload = normalizeEditorialPayload({
      formData,
      eventBlocks,
      manifestoSections,
      looks,
      processSections,
      galleryImages,
    });
    const validationMessage = getEditorialValidationMessage(payload);

    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    if (isEditing) {
      await updateEditorial(id, payload);
    } else {
      await createEditorial(payload);
    }

    navigate("/admin/editorials");
  };

  const renderManifesto = () =>
    manifestoSections.map((section, index) => (
      <div className="admin-page__image-card" key={`manifesto-${index}`} style={{ marginBottom: "12px" }}>
        <figcaption>
          <div className="admin-page__field-row">
            <input
              className="admin-page__input"
              placeholder="섹션 제목"
              value={section.heading}
              onChange={(event) => updateListItem(setManifestoSections, index, "heading", event.target.value)}
            />
            <button className="admin-page__button--ghost" disabled={cloudinaryBusy} type="button" onClick={() => runCloudinaryUpload((url) => updateListItem(setManifestoSections, index, "image", url))}>
              업로드
            </button>
          </div>
          <textarea className="admin-page__textarea" rows="4" value={section.body} onChange={(event) => updateListItem(setManifestoSections, index, "body", event.target.value)} />
          <input className="admin-page__input" placeholder="이미지 설명" value={section.imageAlt} onChange={(event) => updateListItem(setManifestoSections, index, "imageAlt", event.target.value)} />
        </figcaption>
      </div>
    ));

  const renderEventBlocks = () =>
    eventBlocks.map((block, index) => (
      <div className="admin-page__image-card" key={`event-block-${index}`} style={{ marginBottom: "12px" }}>
        <figcaption>
          <div className="admin-page__field-row">
            <input
              className="admin-page__input"
              placeholder="이벤트 제목"
              value={block.title}
              onChange={(event) => updateListItem(setEventBlocks, index, "title", event.target.value)}
            />
            <button
              className="admin-page__button--ghost"
              disabled={cloudinaryBusy}
              type="button"
              onClick={() => runCloudinaryUpload((url) => updateListItem(setEventBlocks, index, "image", url))}
            >
              업로드
            </button>
          </div>
          <input
            className="admin-page__input"
            placeholder="이벤트 라벨"
            value={block.eyebrow}
            onChange={(event) => updateListItem(setEventBlocks, index, "eyebrow", event.target.value)}
          />
          <textarea
            className="admin-page__textarea"
            placeholder="이벤트 설명"
            rows="4"
            value={block.copy}
            onChange={(event) => updateListItem(setEventBlocks, index, "copy", event.target.value)}
          />
          <div className="admin-page__form-grid">
            <input
              className="admin-page__input"
              placeholder="CTA 라벨"
              value={block.ctaLabel}
              onChange={(event) => updateListItem(setEventBlocks, index, "ctaLabel", event.target.value)}
            />
            <input
              className="admin-page__input"
              placeholder="CTA 링크"
              value={block.ctaHref}
              onChange={(event) => updateListItem(setEventBlocks, index, "ctaHref", event.target.value)}
            />
          </div>
          <div className="admin-page__form-grid">
            <input
              className="admin-page__input"
              placeholder="이미지 설명"
              value={block.imageAlt}
              onChange={(event) => updateListItem(setEventBlocks, index, "imageAlt", event.target.value)}
            />
            <select
              className="admin-page__select"
              value={block.alignment}
              onChange={(event) => updateListItem(setEventBlocks, index, "alignment", event.target.value)}
            >
              <option value="left">left</option>
              <option value="center">center</option>
              <option value="right">right</option>
            </select>
          </div>
        </figcaption>
      </div>
    ));

  const renderLooks = () =>
    looks.map((look, index) => (
      <div className="admin-page__image-card" key={`look-${index}`} style={{ marginBottom: "12px" }}>
        <figcaption>
          <div className="admin-page__field-row">
            <input className="admin-page__input" placeholder="룩 제목" value={look.title} onChange={(event) => updateListItem(setLooks, index, "title", event.target.value)} />
            <button className="admin-page__button--ghost" disabled={cloudinaryBusy} type="button" onClick={() => runCloudinaryUpload((url) => updateListItem(setLooks, index, "image", url))}>
              업로드
            </button>
          </div>
          <textarea className="admin-page__textarea" rows="4" value={look.body} onChange={(event) => updateListItem(setLooks, index, "body", event.target.value)} />
          <input className="admin-page__input" placeholder="이미지 설명" value={look.imageAlt} onChange={(event) => updateListItem(setLooks, index, "imageAlt", event.target.value)} />
          <input className="admin-page__input" placeholder="연결 상품 SKU, 예: 2, 3" value={look.linkedSkusText} onChange={(event) => updateListItem(setLooks, index, "linkedSkusText", event.target.value)} />
        </figcaption>
      </div>
    ));

  const renderStudioStory = () => (
    <>
      {processSections.map((section, index) => (
        <div className="admin-page__image-card" key={`process-${index}`} style={{ marginBottom: "12px" }}>
          <figcaption>
            <div className="admin-page__field-row">
              <input className="admin-page__input" placeholder="프로세스 제목" value={section.heading} onChange={(event) => updateListItem(setProcessSections, index, "heading", event.target.value)} />
              <button className="admin-page__button--ghost" disabled={cloudinaryBusy} type="button" onClick={() => runCloudinaryUpload((url) => updateListItem(setProcessSections, index, "image", url))}>
                업로드
              </button>
            </div>
            <textarea className="admin-page__textarea" rows="4" value={section.body} onChange={(event) => updateListItem(setProcessSections, index, "body", event.target.value)} />
            <input className="admin-page__input" placeholder="이미지 설명" value={section.imageAlt} onChange={(event) => updateListItem(setProcessSections, index, "imageAlt", event.target.value)} />
          </figcaption>
        </div>
      ))}
      {galleryImages.map((image, index) => (
        <div className="admin-page__field-row" key={`gallery-${index}`} style={{ marginBottom: "10px" }}>
          <input className="admin-page__input" placeholder="갤러리 이미지 URL" value={image.image} onChange={(event) => updateListItem(setGalleryImages, index, "image", event.target.value)} />
          <input className="admin-page__input" placeholder="이미지 설명" value={image.alt} onChange={(event) => updateListItem(setGalleryImages, index, "alt", event.target.value)} />
          <button className="admin-page__button--ghost" disabled={cloudinaryBusy} type="button" onClick={() => runCloudinaryUpload((url) => updateListItem(setGalleryImages, index, "image", url))}>
            업로드
          </button>
        </div>
      ))}
    </>
  );

  if (!isReady) {
    return <section className="admin-page"><div className="admin-page__empty"><h3>불러오는 중입니다.</h3></div></section>;
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header admin-page__header--compact">
        <div>
          <div className="admin-page__breadcrumbs">
            <Link to="/admin/editorials">에디토리얼</Link>
            <span>/</span>
            <span>{isEditing ? "수정" : "신규 등록"}</span>
          </div>
          <h1 className="admin-page__title">{isEditing ? "에디토리얼 수정" : "에디토리얼 등록"}</h1>
        </div>
        <Link className="admin-page__button--ghost" to="/admin/editorials">목록으로</Link>
      </header>

      <form className="admin-page__form" onSubmit={handleSubmit}>
        <section className="admin-page__form-section">
          <div className="admin-page__section-header admin-page__section-header--form"><h2>기본 정보</h2></div>
          <div className="admin-page__form-body">
            <div className="admin-page__form-grid">
              {["slug", "title", "label", "subtitle", "heroImageAlt", "closingCtaLabel", "closingCtaHref"].map((field) => (
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

            <label className="admin-page__field" style={{ marginTop: "16px" }}>
              <span>hero image</span>
              <div className="admin-page__field-row">
                <input className="admin-page__input" type="url" value={formData.heroImage} onChange={(event) => setFormData((current) => ({ ...current, heroImage: event.target.value }))} />
                <button className="admin-page__button--ghost" disabled={cloudinaryBusy} type="button" onClick={() => runCloudinaryUpload((url) => setFormData((current) => ({ ...current, heroImage: url })))}>업로드</button>
              </div>
            </label>

            <label className="admin-page__field" style={{ marginTop: "16px" }}>
              <span>intro</span>
              <textarea className="admin-page__textarea" rows="5" value={formData.intro} onChange={(event) => setFormData((current) => ({ ...current, intro: event.target.value }))} />
            </label>

            <label className="admin-page__field" style={{ marginTop: "16px" }}>
              <span>related product skus</span>
              <input className="admin-page__input" placeholder="예: 1, 3, 5" type="text" value={formData.relatedProductSkusText} onChange={(event) => setFormData((current) => ({ ...current, relatedProductSkusText: event.target.value }))} />
              <p className="admin-page__muted">{productSkuHelp}</p>
            </label>
          </div>
        </section>

        <section className="admin-page__form-section">
          <div className="admin-page__section-header admin-page__section-header--form">
            <h2>이벤트 블록</h2>
            <p className="admin-page__muted">상단에서 1~3개의 메인 이벤트 카드를 구성합니다.</p>
          </div>
          <div className="admin-page__form-body">
            {renderEventBlocks()}
            {eventBlocks.length < 3 ? (
              <button
                className="admin-page__button--ghost"
                type="button"
                onClick={() => setEventBlocks((current) => [...current, createEventBlock()])}
              >
                이벤트 블록 추가
              </button>
            ) : null}
          </div>
        </section>

        <section className="admin-page__form-section">
          <div className="admin-page__section-header admin-page__section-header--form">
            <h2>포맷 구조</h2>
            <p className="admin-page__muted">{getFormatDescription(formData.format)}</p>
          </div>
          <div className="admin-page__form-body">
            {formData.format === "manifesto" ? renderManifesto() : null}
            {formData.format === "lookbook" ? renderLooks() : null}
            {formData.format === "studio-story" ? renderStudioStory() : null}

            <div className="admin-page__field-row" style={{ marginTop: "12px" }}>
              {formData.format === "manifesto" ? <button className="admin-page__button--ghost" type="button" onClick={() => setManifestoSections((current) => [...current, createManifestoSection()])}>섹션 추가</button> : null}
              {formData.format === "lookbook" ? <button className="admin-page__button--ghost" type="button" onClick={() => setLooks((current) => [...current, createLook()])}>룩 추가</button> : null}
              {formData.format === "studio-story" ? <>
                <button className="admin-page__button--ghost" type="button" onClick={() => setProcessSections((current) => [...current, createProcessSection()])}>프로세스 추가</button>
                <button className="admin-page__button--ghost" type="button" onClick={() => setGalleryImages((current) => [...current, createGalleryImage()])}>갤러리 추가</button>
              </> : null}
            </div>
            {cloudinaryError ? <p className="admin-page__pagination-error">{cloudinaryError}</p> : null}
          </div>
        </section>

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
