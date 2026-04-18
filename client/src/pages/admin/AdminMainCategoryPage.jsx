import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminImageUrlField from "../../components/admin/AdminImageUrlField";
import { useHomeContent } from "../../context/HomeContentContext";
import {
  MOOD_SLUG_OPTIONS,
  createEmptyMoodCategory,
  normalizeHeroSlide,
  normalizeMoodCategory,
} from "../../utils/homeContent";
import { getCloudinaryEnv, openCloudinaryUploadWidget } from "../../utils/cloudinaryWidget";
import { fetchHomeContentDocument, saveHomeContentDocument } from "../../utils/homeContentApi";
import "./AdminPages.css";

function AdminMainCategoryPage() {
  const { refreshHomeContent } = useHomeContent();
  const cloudinaryEnv = getCloudinaryEnv();
  const [baseDoc, setBaseDoc] = useState(null);
  const [moodEyebrow, setMoodEyebrow] = useState("Collection");
  const [moodTitle, setMoodTitle] = useState("Shop by Mood");
  const [moodCategories, setMoodCategories] = useState([]);
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
      setMoodEyebrow(String(data.moodEyebrow || "").trim() || "Collection");
      setMoodTitle(String(data.moodTitle || "").trim() || "Shop by Mood");
      setMoodCategories(
        Array.isArray(data.moodCategories) ? data.moodCategories.map(normalizeMoodCategory) : []
      );
    } catch (fetchError) {
      setError(fetchError.message || "불러오지 못했습니다.");
      setBaseDoc(null);
      setMoodCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleMoodChange = (index, field, value) => {
    setMoodCategories((previous) => {
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

    const heroSlides = Array.isArray(baseDoc.heroSlides)
      ? baseDoc.heroSlides.map((slide, index) => normalizeHeroSlide(slide, index))
      : [];

    const payload = {
      moodEyebrow: String(moodEyebrow || "").trim() || "Collection",
      moodTitle: String(moodTitle || "").trim() || "Shop by Mood",
      heroSlides,
      moodCategories: moodCategories.map(normalizeMoodCategory),
    };

    try {
      const data = await saveHomeContentDocument(payload);
      setBaseDoc(data);
      setMoodEyebrow(String(data.moodEyebrow || "").trim() || "Collection");
      setMoodTitle(String(data.moodTitle || "").trim() || "Shop by Mood");
      setMoodCategories(
        Array.isArray(data.moodCategories) ? data.moodCategories.map(normalizeMoodCategory) : []
      );
      setMessage("메인 카테고리(Shop by Mood)가 저장되었습니다.");
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
          <h1 className="admin-page__title">메인 카테고리</h1>
          <p className="admin-page__muted" style={{ marginTop: 8, maxWidth: 560 }}>
            Shop by Mood 섹션 제목과 카드(이미지·문구·연결 카테고리)를 수정합니다. 상단 히어로 슬라이드는
            &quot;메인 슬라이드&quot; 메뉴에서 다룹니다.
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
              <h2>섹션 제목 (Shop by Mood)</h2>
            </div>
            <div className="admin-page__panel-body">
              <div className="admin-page__form-grid">
                <label className="admin-page__field">
                  <span>상단 작은 문구 (Eyebrow)</span>
                  <input
                    className="admin-page__input"
                    type="text"
                    value={moodEyebrow}
                    onChange={(event) => setMoodEyebrow(event.target.value)}
                    placeholder="예: Collection"
                  />
                </label>
                <label className="admin-page__field">
                  <span>메인 제목</span>
                  <input
                    className="admin-page__input"
                    type="text"
                    value={moodTitle}
                    onChange={(event) => setMoodTitle(event.target.value)}
                    placeholder="예: Shop by Mood"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="admin-page__form-section admin-page__panel">
            <div className="admin-page__section-header admin-page__section-header--plain">
              <h2>무드 카드 목록</h2>
              <button
                className="admin-page__button"
                type="button"
                onClick={() => setMoodCategories((previous) => [...previous, createEmptyMoodCategory()])}
              >
                새 무드 카드 추가
              </button>
            </div>
            <div className="admin-page__panel-body">
              <p className="admin-page__muted" style={{ marginTop: 0 }}>
                연결 경로(slug)는 스토어 카테고리 페이지와 같아야 합니다. 잘못된 값은 저장 시 거절됩니다.
              </p>
              <div className="admin-page__form" style={{ gap: 28 }}>
                {moodCategories.map((category, index) => (
                  <article key={`${category.slug}-${index}`} className="admin-home-block">
                    <div className="admin-home-block__head">
                      <h3 className="admin-home-block__title">무드 카드 {index + 1}</h3>
                      <button
                        className="admin-page__button admin-page__button--ghost"
                        disabled={moodCategories.length <= 1}
                        type="button"
                        onClick={() =>
                          setMoodCategories((previous) =>
                            previous.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                      >
                        이 카드 삭제
                      </button>
                    </div>

                    <div className="admin-home-block__stack">
                      <div className="admin-home-block__grid-2">
                        <label className="admin-page__field">
                          <span>표시 제목</span>
                          <input
                            className="admin-page__input"
                            required
                            type="text"
                            value={category.title}
                            onChange={(event) => handleMoodChange(index, "title", event.target.value)}
                          />
                        </label>
                        <label className="admin-page__field">
                          <span>연결 카테고리 (slug)</span>
                          <select
                            className="admin-page__input admin-page__select"
                            value={category.slug}
                            onChange={(event) => handleMoodChange(index, "slug", event.target.value)}
                          >
                            {MOOD_SLUG_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <label className="admin-page__field">
                        <span>설명</span>
                        <textarea
                          className="admin-page__textarea"
                          rows={2}
                          value={category.description}
                          onChange={(event) => handleMoodChange(index, "description", event.target.value)}
                        />
                      </label>

                      <AdminImageUrlField
                        required
                        cloudinaryDisabled={!cloudinaryEnv.ready}
                        label="카드 배경 이미지"
                        previewAlt={`${category.title || "무드 카드"} 이미지`}
                        value={category.image}
                        onChange={(next) => handleMoodChange(index, "image", next)}
                        onCloudinaryClick={() =>
                          runCloudinaryUpload((url) => handleMoodChange(index, "image", url))
                        }
                      />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-page__actions">
            <button className="admin-page__button" disabled={isSaving} type="submit">
              {isSaving ? "저장 중…" : "메인 카테고리 저장"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default AdminMainCategoryPage;
