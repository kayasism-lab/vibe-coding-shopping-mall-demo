import React from "react";
import EditorialImageField from "./EditorialImageField";

function EditorialFormatEditor({
  format,
  manifestoSections,
  setManifestoSections,
  looks,
  setLooks,
  processSections,
  setProcessSections,
  galleryImages,
  setGalleryImages,
  cloudinaryBusy,
  onUploadImage,
  onAddManifesto,
  onAddLook,
  onAddProcess,
  onAddGallery,
  productSkuHelp,
}) {
  const updateListItem = (setter, index, field, value) => {
    setter((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  const items =
    format === "manifesto"
      ? manifestoSections.map((section, index) => (
          <div className="admin-page__image-card" key={`manifesto-${index}`} style={{ marginBottom: 12 }}>
            <figcaption className="admin-page__form-grid admin-page__form-grid--single">
              <label className="admin-page__field">
                <span>제목</span>
                <input className="admin-page__input" type="text" value={section.heading} onChange={(event) => updateListItem(setManifestoSections, index, "heading", event.target.value)} />
              </label>
              <label className="admin-page__field">
                <span>설명</span>
                <textarea className="admin-page__textarea" rows="4" value={section.body} onChange={(event) => updateListItem(setManifestoSections, index, "body", event.target.value)} />
              </label>
              <EditorialImageField
                disabled={cloudinaryBusy}
                label="이미지 URL"
                previewAlt={`매니페스토 섹션 ${index + 1} 미리보기`}
                value={section.image}
                onChange={(value) => updateListItem(setManifestoSections, index, "image", value)}
                onUpload={() => onUploadImage((url) => updateListItem(setManifestoSections, index, "image", url))}
              />
            </figcaption>
          </div>
        ))
      : format === "lookbook"
        ? looks.map((look, index) => (
            <div className="admin-page__image-card" key={`look-${index}`} style={{ marginBottom: 12 }}>
              <figcaption className="admin-page__form-grid admin-page__form-grid--single">
                <label className="admin-page__field">
                  <span>제목</span>
                  <input className="admin-page__input" type="text" value={look.title} onChange={(event) => updateListItem(setLooks, index, "title", event.target.value)} />
                </label>
                <label className="admin-page__field">
                  <span>설명</span>
                  <textarea className="admin-page__textarea" rows="4" value={look.body} onChange={(event) => updateListItem(setLooks, index, "body", event.target.value)} />
                </label>
                <EditorialImageField
                  disabled={cloudinaryBusy}
                  label="이미지 URL"
                  previewAlt={`룩북 섹션 ${index + 1} 미리보기`}
                  value={look.image}
                  onChange={(value) => updateListItem(setLooks, index, "image", value)}
                  onUpload={() => onUploadImage((url) => updateListItem(setLooks, index, "image", url))}
                />
                <label className="admin-page__field">
                  <span>연결 상품 SKU</span>
                  <input className="admin-page__input" placeholder="예: 2, 3" type="text" value={look.linkedSkusText} onChange={(event) => updateListItem(setLooks, index, "linkedSkusText", event.target.value)} />
                  <p className="admin-page__muted">{productSkuHelp}</p>
                </label>
              </figcaption>
            </div>
          ))
        : (
            <>
              {processSections.map((section, index) => (
                <div className="admin-page__image-card" key={`process-${index}`} style={{ marginBottom: 12 }}>
                  <figcaption className="admin-page__form-grid admin-page__form-grid--single">
                    <label className="admin-page__field">
                      <span>제목</span>
                      <input className="admin-page__input" type="text" value={section.heading} onChange={(event) => updateListItem(setProcessSections, index, "heading", event.target.value)} />
                    </label>
                    <label className="admin-page__field">
                      <span>설명</span>
                      <textarea className="admin-page__textarea" rows="4" value={section.body} onChange={(event) => updateListItem(setProcessSections, index, "body", event.target.value)} />
                    </label>
                    <EditorialImageField
                      disabled={cloudinaryBusy}
                      label="이미지 URL"
                      previewAlt={`프로세스 섹션 ${index + 1} 미리보기`}
                      value={section.image}
                      onChange={(value) => updateListItem(setProcessSections, index, "image", value)}
                      onUpload={() => onUploadImage((url) => updateListItem(setProcessSections, index, "image", url))}
                    />
                  </figcaption>
                </div>
              ))}
              {galleryImages.map((image, index) => (
                <div className="admin-page__image-card" key={`gallery-${index}`} style={{ marginBottom: 12 }}>
                  <figcaption className="admin-page__form-grid admin-page__form-grid--single">
                    <EditorialImageField
                      disabled={cloudinaryBusy}
                      label="갤러리 이미지 URL"
                      previewAlt={`갤러리 이미지 ${index + 1} 미리보기`}
                      value={image.image}
                      onChange={(value) => updateListItem(setGalleryImages, index, "image", value)}
                      onUpload={() => onUploadImage((url) => updateListItem(setGalleryImages, index, "image", url))}
                    />
                  </figcaption>
                </div>
              ))}
            </>
          );

  return (
    <section className="admin-page__form-section">
      <div className="admin-page__section-header admin-page__section-header--form">
        <h2>상세 페이지 구성</h2>
      </div>
      <div className="admin-page__form-body">
        {items}
        <div className="admin-page__field-row" style={{ marginTop: 12 }}>
          {format === "manifesto" ? <button className="admin-page__button--ghost" type="button" onClick={onAddManifesto}>섹션 추가</button> : null}
          {format === "lookbook" ? <button className="admin-page__button--ghost" type="button" onClick={onAddLook}>룩 추가</button> : null}
          {format === "studio-story" ? (
            <>
              <button className="admin-page__button--ghost" type="button" onClick={onAddProcess}>프로세스 추가</button>
              <button className="admin-page__button--ghost" type="button" onClick={onAddGallery}>갤러리 추가</button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default EditorialFormatEditor;
