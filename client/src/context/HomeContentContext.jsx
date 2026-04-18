/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HOME_CONTENT_API_URL } from "../utils/auth";
import { parseApiJsonResponse } from "../utils/apiJson";
import {
  getFallbackHomeContent,
  normalizeHeroSlide,
  normalizeMoodCategory,
} from "../utils/homeContent";

const HomeContentContext = createContext(null);

const normalizeResponse = (payload) => {
  const fallback = getFallbackHomeContent();
  const heroSlides = Array.isArray(payload?.heroSlides)
    ? payload.heroSlides.map((slide, index) => normalizeHeroSlide(slide, index))
    : fallback.heroSlides;
  const moodCategories = Array.isArray(payload?.moodCategories)
    ? payload.moodCategories.map(normalizeMoodCategory)
    : fallback.moodCategories;

  return {
    moodEyebrow: String(payload?.moodEyebrow || fallback.moodEyebrow).trim() || fallback.moodEyebrow,
    moodTitle: String(payload?.moodTitle || fallback.moodTitle).trim() || fallback.moodTitle,
    heroSlides: heroSlides.length > 0 ? heroSlides : fallback.heroSlides,
    moodCategories: moodCategories.length > 0 ? moodCategories : fallback.moodCategories,
    updatedAt: payload?.updatedAt || null,
  };
};

export function HomeContentProvider({ children }) {
  const [data, setData] = useState(() => getFallbackHomeContent());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshHomeContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(HOME_CONTENT_API_URL);
      const payload = await parseApiJsonResponse(response);

      if (!response.ok) {
        throw new Error(payload?.message || "메인 콘텐츠를 불러오지 못했습니다.");
      }

      setData(normalizeResponse(payload));
      setError("");
    } catch (fetchError) {
      setData(getFallbackHomeContent());
      setError(fetchError.message || "메인 콘텐츠를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshHomeContent();
  }, [refreshHomeContent]);

  const value = useMemo(
    () => ({
      ...data,
      isLoading,
      error,
      refreshHomeContent,
    }),
    [data, error, isLoading, refreshHomeContent]
  );

  return <HomeContentContext.Provider value={value}>{children}</HomeContentContext.Provider>;
}

export function useHomeContent() {
  const ctx = useContext(HomeContentContext);
  if (!ctx) {
    throw new Error("useHomeContent는 HomeContentProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}
