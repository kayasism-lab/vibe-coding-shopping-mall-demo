import React from "react";
import "../AdminImageUrlField.css";

function EditorialImageField({
  label,
  value,
  onChange,
  onUpload,
  disabled = false,
  previewAlt,
  required = false,
}) {
  return (
    <label className="admin-page__field">
      <span>{label}</span>
      <div className="admin-page__field-row">
        <input
          className="admin-page__input"
          required={required}
          style={{ flex: 1, minWidth: 0 }}
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          className="admin-page__button--ghost"
          disabled={disabled}
          type="button"
          onClick={onUpload}
        >
          업로드
        </button>
      </div>
      {value.trim() ? (
        <div className="admin-image-url-field__preview-box">
          <img
            alt={previewAlt}
            className="admin-page__url-preview admin-image-url-field__preview-img"
            loading="lazy"
            src={value.trim()}
          />
        </div>
      ) : null}
    </label>
  );
}

export default EditorialImageField;
