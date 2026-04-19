import { useCallback, useRef } from "react";
import "./EditorialHeroFramingField.css";

function clampPercent(value) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return 50;
  }
  return Math.min(100, Math.max(0, n));
}

/**
 * SNS 프로필 사진처럼, 고정 비율 박스 안에서 cover 배경의 초점(위치)을 드래그로 맞춥니다.
 * 저장 값은 CSS background-position 퍼센트(0–100) 두 개입니다.
 */
const DEFAULT_HINT =
  "아래 박스는 상세 페이지 상단 히어로와 비슷한 낮은 배너 비율로 보여 줍니다. 안에서 드래그해 실제에 보일 영역을 맞춥니다.";

export default function EditorialHeroFramingField({
  imageUrl,
  posX,
  posY,
  onChange,
  disabled = false,
  previewAspectRatio = "21 / 5",
  previewMaxWidth = 720,
  hint,
}) {
  const viewportRef = useRef(null);
  const trimmed = String(imageUrl || "").trim();

  const attachPointerDrag = useCallback(
    (clientX, clientY) => {
      const el = document.activeElement;
      if (el && typeof el.blur === "function") {
        el.blur();
      }

      const node = viewportRef.current;
      const rect = node?.getBoundingClientRect();
      if (!rect || rect.width < 1 || rect.height < 1) {
        return;
      }

      const startX = clientX;
      const startY = clientY;
      const basePx = clampPercent(posX);
      const basePy = clampPercent(posY);

      const onMove = (ev) => {
        if (ev.type === "touchmove" && ev.cancelable) {
          ev.preventDefault();
        }
        const cx = "clientX" in ev ? ev.clientX : ev.touches?.[0]?.clientX;
        const cy = "clientY" in ev ? ev.clientY : ev.touches?.[0]?.clientY;
        if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
          return;
        }
        const dx = cx - startX;
        const dy = cy - startY;
        const nextX = clampPercent(basePx - (dx / rect.width) * 100);
        const nextY = clampPercent(basePy - (dy / rect.height) * 100);
        onChange({ posX: nextX, posY: nextY });
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onUp);
        window.removeEventListener("touchcancel", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);
      window.addEventListener("touchcancel", onUp);
    },
    [onChange, posX, posY]
  );

  const maxWidthStyle =
    typeof previewMaxWidth === "number" ? `${previewMaxWidth}px` : String(previewMaxWidth ?? "720px");

  if (!trimmed) {
    return (
      <div className="editorial-hero-framing">
        <p className="admin-page__muted editorial-hero-framing__hint">
          히어로 이미지 URL을 입력하거나 업로드한 뒤, 여기서 보이는 영역을 조정할 수 있습니다.
        </p>
      </div>
    );
  }

  const x = clampPercent(posX);
  const y = clampPercent(posY);
  const hintParagraph =
    hint === ""
      ? null
      : hint === undefined
        ? DEFAULT_HINT
        : hint;

  return (
    <div className="editorial-hero-framing">
      {hintParagraph ? (
        <p className="admin-page__muted editorial-hero-framing__hint">{hintParagraph}</p>
      ) : null}
      <div
        ref={viewportRef}
        className={`editorial-hero-framing__viewport ${disabled ? "is-disabled" : ""}`}
        role="presentation"
        style={{
          aspectRatio: previewAspectRatio,
          maxWidth: maxWidthStyle,
          backgroundImage: `url(${trimmed})`,
          backgroundSize: "cover",
          backgroundPosition: `${x}% ${y}%`,
        }}
        onMouseDown={(e) => {
          if (disabled) {
            return;
          }
          e.preventDefault();
          attachPointerDrag(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          if (disabled) {
            return;
          }
          const t = e.touches[0];
          if (!t) {
            return;
          }
          e.preventDefault();
          attachPointerDrag(t.clientX, t.clientY);
        }}
      />
      <div className="editorial-hero-framing__row">
        <button
          className="admin-page__button admin-page__button--ghost"
          disabled={disabled}
          type="button"
          onClick={() => onChange({ posX: 50, posY: 50 })}
        >
          중앙으로
        </button>
        <span className="editorial-hero-framing__coords">
          가로 {x.toFixed(0)}% · 세로 {y.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
