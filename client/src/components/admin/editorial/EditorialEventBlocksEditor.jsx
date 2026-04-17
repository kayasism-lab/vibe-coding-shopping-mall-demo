import React from "react";
import EditorialImageField from "./EditorialImageField";

function EditorialEventBlocksEditor({
  eventBlocks,
  setEventBlocks,
  cloudinaryBusy,
  onUploadImage,
  onAddBlock,
}) {
  const updateBlockField = (index, field, value) => {
    setEventBlocks((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <section className="admin-page__form-section">
      <div className="admin-page__section-header admin-page__section-header--form">
        <div>
          <h2>홈 카드 / 이벤트 블록</h2>
          <p className="admin-page__muted">홈과 상세 상단에 노출되는 1~3개의 카드입니다.</p>
        </div>
      </div>
      <div className="admin-page__form-body">
        {eventBlocks.map((block, index) => (
          <div className="admin-page__image-card" key={`event-block-${index}`} style={{ marginBottom: 12 }}>
            <figcaption>
              <div className="admin-page__form-grid admin-page__form-grid--single">
                <label className="admin-page__field">
                  <span>라벨</span>
                  <input
                    className="admin-page__input"
                    placeholder="예: Edit 01"
                    type="text"
                    value={block.eyebrow}
                    onChange={(event) => updateBlockField(index, "eyebrow", event.target.value)}
                  />
                </label>
                <label className="admin-page__field">
                  <span>제목</span>
                  <input
                    className="admin-page__input"
                    placeholder="이벤트 제목"
                    type="text"
                    value={block.title}
                    onChange={(event) => updateBlockField(index, "title", event.target.value)}
                  />
                </label>
                <label className="admin-page__field">
                  <span>설명</span>
                  <textarea
                    className="admin-page__textarea"
                    placeholder="이벤트 설명"
                    rows="4"
                    value={block.copy}
                    onChange={(event) => updateBlockField(index, "copy", event.target.value)}
                  />
                </label>
                <EditorialImageField
                  disabled={cloudinaryBusy}
                  label="이미지 URL"
                  previewAlt={`이벤트 블록 ${index + 1} 미리보기`}
                  value={block.image}
                  onChange={(value) => updateBlockField(index, "image", value)}
                  onUpload={() => onUploadImage((url) => updateBlockField(index, "image", url))}
                />
              </div>
            </figcaption>
          </div>
        ))}

        {eventBlocks.length < 3 ? (
          <button className="admin-page__button--ghost" type="button" onClick={onAddBlock}>
            카드 추가
          </button>
        ) : null}
      </div>
    </section>
  );
}

export default EditorialEventBlocksEditor;
