import "./AdminImageUrlField.css";

export default function AdminImageUrlField({
  label,
  value,
  onChange,
  onCloudinaryClick,
  previewAlt,
  required = false,
  cloudinaryDisabled = false,
}) {
  const hasImage = Boolean(value?.trim());

  return (
    <div className="admin-image-url-field">
      <label className="admin-page__field">
        <span>{label}</span>
        <div className="admin-page__field-row admin-image-url-field__row">
          <input
            className="admin-page__input admin-image-url-field__input"
            required={required}
            type="url"
            value={value}
            placeholder="https://..."
            onChange={(event) => onChange(event.target.value)}
          />
          <button
            className="admin-page__button admin-page__button--ghost admin-image-url-field__cloudinary"
            disabled={cloudinaryDisabled}
            title={
              cloudinaryDisabled
                ? "VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET 필요"
                : "이미지 업로드 (Cloudinary)"
            }
            type="button"
            onClick={onCloudinaryClick}
          >
            업로드
          </button>
        </div>
        {hasImage ? (
          <figure className="admin-image-url-field__figure">
            <img
              alt={previewAlt}
              className="admin-page__url-preview"
              loading="lazy"
              src={value.trim()}
            />
            <figcaption className="admin-page__muted admin-image-url-field__caption">
              미리보기 · URL을 바꾸거나 업로드하면 즉시 반영됩니다
            </figcaption>
          </figure>
        ) : (
          <p className="admin-page__muted admin-image-url-field__hint">
            이미지 URL을 입력하거나 업로드로 등록하세요.
          </p>
        )}
      </label>
    </div>
  );
}
