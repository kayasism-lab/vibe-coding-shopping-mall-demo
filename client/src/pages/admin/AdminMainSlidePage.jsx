import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminImageUrlField from "../../components/admin/AdminImageUrlField";
import EditorialHeroFramingField from "../../components/admin/editorial/EditorialHeroFramingField";
import { useHomeContent } from "../../context/HomeContentContext";
import {
  createEmptyHeroSlide,
  normalizeHeroSlide,
  normalizeMoodCategory,
} from "../../utils/homeContent";
import { getCloudinaryEnv, openCloudinaryUploadWidget } from "../../utils/cloudinaryWidget";
import { fetchHomeContentDocument, saveHomeContentDocument } from "../../utils/homeContentApi";
import { formatLastSavedLine } from "../../utils/formatLastSavedLine";
import "./AdminPages.css";

function AdminMainSlidePage() {
  const navigate = useNavigate();
  const { refreshHomeContent } = useHomeContent();
  const cloudinaryEnv = getCloudinaryEnv();
  const [baseDoc, setBaseDoc] = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedLine, setLastSavedLine] = useState("");
  const [error, setError] = useState("");
  const [cloudinaryError, setCloudinaryError] = useState("");

  const load = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setIsLoading(true);
    }
    setError("");
    try {
      const data = await fetchHomeContentDocument();
      setBaseDoc(data);
      setHeroSlides(
        Array.isArray(data.heroSlides)
          ? data.heroSlides.map((slide, index) => normalizeHeroSlide(slide, index))
          : []
      );
    } catch (fetchError) {
      setError(fetchError.message || "불러오지 못했습니다.");
      setBaseDoc(null);
      setHeroSlides([]);
      throw fetchError;
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleHeroChange = (index, field, value) => {
    setHeroSlides((previous) => {
      const next = [...previous];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSlideImageChange = (index, nextImage) => {
    setHeroSlides((previous) => {
      const copy = [...previous];
      const cur = copy[index];
      const changed = String(cur.image || "").trim() !== String(nextImage || "").trim();
      copy[index] = {
        ...cur,
        image: nextImage,
        ...(changed ? { imagePosX: 50, imagePosY: 50 } : {}),
      };
      return copy;
    });
  };

  const handleSlideFramingChange = (index, { posX, posY }) => {
    setHeroSlides((previous) => {
      const copy = [...previous];
      copy[index] = { ...copy[index], imagePosX: posX, imagePosY: posY };
      return copy;
    });
  };

  const runCloudinaryUpload = (applyUrl) => {
    if (!cloudinaryEnv.ready) {
      window.alert("Cloudinary 환경 변수(VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET)를 설정해주세요.");
      return;
    }
    setCloudinaryError("");
    void openCloudinaryUploadWidget({
      onSuccess: (url) => applyUrl(url),
      onError: (msg) => setCloudinaryError(msg),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!baseDoc) {
      setError("데이터를 먼저 불러와 주세요.");
      return;
    }

    setIsSaving(true);
    setError("");

    const moodCategories = Array.isArray(baseDoc.moodCategories)
      ? baseDoc.moodCategories.map(normalizeMoodCategory)
      : [];

    const payload = {
      moodEyebrow: String(baseDoc.moodEyebrow || "").trim() || "Collection",
      moodTitle: String(baseDoc.moodTitle || "").trim() || "Shop by Mood",
      heroSlides: heroSlides.map((slide, index) => normalizeHeroSlide(slide, index)),
      moodCategories,
    };

    try {
      const data = await saveHomeContentDocument(payload);
      setBaseDoc(data);
      setHeroSlides(
        Array.isArray(data.heroSlides)
          ? data.heroSlides.map((slide, index) => normalizeHeroSlide(slide, index))
          : []
      );
      setLastSavedLine(formatLastSavedLine(new Date()));
      await refreshHomeContent();
    } catch (saveError) {
      setError(saveError.message || "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    setLastSavedLine("");
    setCloudinaryError("");
    try {
      await load({ showLoading: false });
      navigate("/admin");
    } catch {
      if (window.confirm("저장된 최신 데이터를 불러오지 못했습니다. 그대로 나가시겠습니까?")) {
        navigate("/admin");
      }
    }
  };

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">스토어 프론트</p>
          <h1 className="admin-page__title">메인 슬라이드</h1>
          <p className="admin-page__muted" style={{ marginTop: 8, maxWidth: 560 }}>
            메인 상단 히어로(자동 전환 슬라이드)의 배경 이미지와 문구를 수정합니다.
            <br />
            Shop by Mood는 &quot;메인 카테고리&quot; 메뉴에서 다룹니다.
          </p>
          {!cloudinaryEnv.ready ? (
            <p className="admin-page__pagination-error" style={{ marginTop: 12, marginBottom: 0, maxWidth: 560 }}>
              Cloudinary가 설정되지 않았습니다. 이미지 URL을 직접 붙여 넣을 수 있습니다.
            </p>
          ) : null}
        </div>
        <Link className="admin-page__button admin-page__button--ghost" to="/">
          스토어에서 보기
        </Link>
      </header>

      {isLoading ? (
        <p className="admin-page__muted">불러오는 중…</p>
      ) : (
        <form className="admin-page__form" onSubmit={handleSubmit}>
          <div className="admin-page__form-actions admin-page__form-actions--top">
            <div className="admin-page__form-actions__messages">
              {lastSavedLine ? <p className="admin-page__muted">{lastSavedLine}</p> : null}
              {error ? <p className="admin-page__pagination-error">{error}</p> : null}
              {cloudinaryError ? <p className="admin-page__pagination-error">{cloudinaryError}</p> : null}
            </div>
            <button
              className="admin-page__button--ghost"
              disabled={isSaving}
              type="button"
              onClick={() => void handleCancel()}
            >
              취소
            </button>
            <button className="admin-page__button" disabled={isSaving} type="submit">
              {isSaving ? "저장 중…" : "메인 슬라이드 저장"}
            </button>
          </div>

          <div className="admin-page__form-section admin-page__panel">
            <div className="admin-page__section-header admin-page__section-header--plain">
              <h2>히어로 슬라이드 목록</h2>
              <button
                className="admin-page__button"
                type="button"
                onClick={() => setHeroSlides((previous) => [...previous, createEmptyHeroSlide()])}
              >
                새 슬라이드 추가
              </button>
            </div>
            <div className="admin-page__panel-body">
              <p className="admin-page__muted" style={{ marginTop: 0 }}>
                각 블록은 위에서 아래로 순서대로 메인에 표시됩니다. 삭제는 해당 슬라이드만 제거합니다.
              </p>
              <div className="admin-page__form" style={{ gap: 28 }}>
                {heroSlides.map((slide, index) => (
                  <article key={slide.id} className="admin-home-block">
                    <div className="admin-home-block__head">
                      <h3 className="admin-home-block__title">슬라이드 {index + 1}</h3>
                      <button
                        className="admin-page__button admin-page__button--ghost"
                        disabled={heroSlides.length <= 1}
                        type="button"
                        onClick={() =>
                          setHeroSlides((previous) => previous.filter((_, itemIndex) => itemIndex !== index))
                        }
                      >
                        이 슬라이드 삭제
                      </button>
                    </div>

                    <div className="admin-home-block__stack">
                      <AdminImageUrlField
                        required
                        cloudinaryDisabled={!cloudinaryEnv.ready}
                        label="배경 이미지"
                        previewAlt={`슬라이드 ${index + 1} 배경`}
                        value={slide.image}
                        onChange={(next) => handleSlideImageChange(index, next)}
                        onCloudinaryClick={() =>
                          runCloudinaryUpload((url) => handleSlideImageChange(index, url))
                        }
                      />

                      <div className="admin-page__field" style={{ marginTop: 4 }}>
                        <span>메인 히어로 프레이밍 (드래그)</span>
                        <p className="admin-page__muted editorial-hero-framing__hint" style={{ margin: "0 0 10px" }}>
                          위 미리보기는 업로드 원본 비율입니다. 아래 박스는 메인 페이지 상단 풀스크린 히어로(실제
                          스토어)에 가깝게 잡혀 있으며, 드래그하면 그 페이지에서 보이는 배경 영역을 맞출 수 있습니다.
                        </p>
                        <EditorialHeroFramingField
                          disabled={isSaving}
                          hint=""
                          imageUrl={slide.image}
                          posX={slide.imagePosX}
                          posY={slide.imagePosY}
                          previewAspectRatio="2 / 1"
                          previewMaxWidth={880}
                          onChange={(next) => handleSlideFramingChange(index, next)}
                        />
                      </div>

                      <div className="admin-home-block__grid-2">
                        <label className="admin-page__field">
                          <span>부제 (소제목)</span>
                          <input
                            className="admin-page__input"
                            type="text"
                            value={slide.subtitle}
                            onChange={(event) => handleHeroChange(index, "subtitle", event.target.value)}
                          />
                        </label>
                        <label className="admin-page__field">
                          <span>제목</span>
                          <input
                            className="admin-page__input"
                            required
                            type="text"
                            value={slide.title}
                            onChange={(event) => handleHeroChange(index, "title", event.target.value)}
                          />
                        </label>
                      </div>

                      <label className="admin-page__field">
                        <span>설명</span>
                        <textarea
                          className="admin-page__textarea"
                          rows={3}
                          value={slide.description}
                          onChange={(event) => handleHeroChange(index, "description", event.target.value)}
                        />
                      </label>

                      <div className="admin-home-block__grid-2">
                        <label className="admin-page__field">
                          <span>CTA 버튼 문구</span>
                          <input
                            className="admin-page__input"
                            type="text"
                            value={slide.ctaLabel}
                            onChange={(event) => handleHeroChange(index, "ctaLabel", event.target.value)}
                          />
                        </label>
                        <label className="admin-page__field">
                          <span>CTA 링크</span>
                          <input
                            className="admin-page__input"
                            type="text"
                            value={slide.ctaHref}
                            onChange={(event) => handleHeroChange(index, "ctaHref", event.target.value)}
                            placeholder="#products 또는 https://…"
                          />
                        </label>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}

export default AdminMainSlidePage;
