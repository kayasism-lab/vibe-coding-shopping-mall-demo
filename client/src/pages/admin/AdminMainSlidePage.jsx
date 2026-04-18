import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminImageUrlField from "../../components/admin/AdminImageUrlField";
import { useHomeContent } from "../../context/HomeContentContext";
import {
  createEmptyHeroSlide,
  normalizeHeroSlide,
  normalizeMoodCategory,
} from "../../utils/homeContent";
import { getCloudinaryEnv, openCloudinaryUploadWidget } from "../../utils/cloudinaryWidget";
import { fetchHomeContentDocument, saveHomeContentDocument } from "../../utils/homeContentApi";
import "./AdminPages.css";

function AdminMainSlidePage() {
  const { refreshHomeContent } = useHomeContent();
  const cloudinaryEnv = getCloudinaryEnv();
  const [baseDoc, setBaseDoc] = useState(null);
  const [heroSlides, setHeroSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cloudinaryError, setCloudinaryError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    setMessage("");
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
      setMessage("메인 슬라이드가 저장되었습니다.");
      await refreshHomeContent();
    } catch (saveError) {
      setError(saveError.message || "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">스토어 프론트</p>
          <h1 className="admin-page__title">메인 슬라이드</h1>
          <p className="admin-page__muted" style={{ marginTop: 8, maxWidth: 560 }}>
            메인 상단 히어로(자동 전환 슬라이드)의 배경 이미지와 문구를 수정합니다. Shop by Mood는 &quot;메인
            카테고리&quot; 메뉴에서 다룹니다.
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
          {message ? <p className="admin-page__muted">{message}</p> : null}
          {error ? <p className="admin-page__pagination-error">{error}</p> : null}
          {cloudinaryError ? <p className="admin-page__pagination-error">{cloudinaryError}</p> : null}

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
                        onChange={(next) => handleHeroChange(index, "image", next)}
                        onCloudinaryClick={() =>
                          runCloudinaryUpload((url) => handleHeroChange(index, "image", url))
                        }
                      />

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

          <div className="admin-page__actions">
            <button className="admin-page__button" disabled={isSaving} type="submit">
              {isSaving ? "저장 중…" : "메인 슬라이드 저장"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default AdminMainSlidePage;
