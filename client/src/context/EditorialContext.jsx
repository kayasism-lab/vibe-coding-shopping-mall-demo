/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fallbackEditorials } from "../data/editorials";
import { API_BASE_URL, getAuthorizationHeader } from "../utils/auth";

const EDITORIALS_API_URL = `${API_BASE_URL}/api/editorials`;
const EditorialContext = createContext(null);

const normalizeImageBlocks = (items, key = "heading") =>
  Array.isArray(items)
    ? items.map((item) => ({
        [key]: item?.[key] || "",
        title: item?.title || "",
        body: item?.body || "",
        image: item?.image || "",
        imageAlt: item?.imageAlt || "",
        alt: item?.alt || "",
        linkedSkus: Array.isArray(item?.linkedSkus) ? item.linkedSkus.map(Number).filter(Boolean) : [],
      }))
    : [];

const normalizeEventBlocks = (items) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          eyebrow: String(item?.eyebrow || "").trim(),
          title: String(item?.title || "").trim(),
          copy: String(item?.copy || "").trim(),
          image: String(item?.image || "").trim(),
          imageAlt: String(item?.imageAlt || "").trim(),
          ctaLabel: String(item?.ctaLabel || "").trim(),
          ctaHref: String(item?.ctaHref || "").trim(),
          alignment: ["left", "center", "right"].includes(String(item?.alignment || "").trim())
            ? String(item.alignment).trim()
            : "left",
        }))
        .filter((item) => item.title || item.copy || item.image)
        .slice(0, 3)
    : [];

const normalizeEditorial = (item) => ({
  ...item,
  _id: item._id || item.id || item.slug,
  slug: String(item.slug || "").trim(),
  homeOrder: Number.isFinite(Number(item?.homeOrder)) ? Number(item.homeOrder) : 0,
  title: String(item.title || "").trim(),
  label: String(item.label || "").trim(),
  subtitle: String(item.subtitle || "").trim(),
  format: String(item.format || "manifesto").trim(),
  status: String(item.status || "draft").trim(),
  heroImage: String(item.heroImage || "").trim(),
  heroImageAlt: String(item.heroImageAlt || "").trim(),
  heroImagePosX: Number.isFinite(Number(item?.heroImagePosX)) ? Number(item.heroImagePosX) : 50,
  heroImagePosY: Number.isFinite(Number(item?.heroImagePosY)) ? Number(item.heroImagePosY) : 50,
  intro: String(item.intro || "").trim(),
  eventBlocks: normalizeEventBlocks(item.eventBlocks),
  closingCtaLabel: String(item.closingCtaLabel || "").trim(),
  closingCtaHref: String(item.closingCtaHref || "").trim(),
  relatedProductSkus: Array.isArray(item.relatedProductSkus)
    ? item.relatedProductSkus.map(Number).filter(Boolean)
    : [],
  manifestoSections: normalizeImageBlocks(item.manifestoSections, "heading"),
  looks: normalizeImageBlocks(item.looks, "title"),
  processSections: normalizeImageBlocks(item.processSections, "heading"),
  galleryImages: Array.isArray(item.galleryImages)
    ? item.galleryImages.map((image) => ({
        image: String(image?.image || "").trim(),
        alt: String(image?.alt || "").trim(),
      }))
    : [],
});

export function EditorialProvider({ children }) {
  const [editorials, setEditorials] = useState(() =>
    fallbackEditorials.map(normalizeEditorial)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshEditorials = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(EDITORIALS_API_URL);
      const data = await response.json();

      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.message || "에디토리얼 목록을 불러오지 못했습니다.");
      }

      setEditorials(data.map(normalizeEditorial));
      setError("");
    } catch (fetchError) {
      setEditorials(fallbackEditorials.map(normalizeEditorial));
      setError(fetchError.message || "에디토리얼 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEditorials();
  }, [refreshEditorials]);

  const getEditorialBySlug = useCallback(
    (slug) => editorials.find((item) => item.slug === String(slug || "").trim()) || null,
    [editorials]
  );

  const getHomeEditorials = useCallback(() => {
    const published = editorials.filter((e) => e.status === "published");
    return [...published].sort((a, b) => {
      const ao = Number.isFinite(a.homeOrder) ? a.homeOrder : 9999;
      const bo = Number.isFinite(b.homeOrder) ? b.homeOrder : 9999;
      if (ao !== bo) {
        return ao - bo;
      }
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
  }, [editorials]);

  const requestAdminMutation = useCallback(async (url, method, payload) => {
    const authorizationHeader = getAuthorizationHeader();

    if (!authorizationHeader) {
      throw new Error("관리자 인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationHeader,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await response.json() : null;

    if (!response.ok) {
      throw new Error(data?.message || "에디토리얼 요청 처리에 실패했습니다.");
    }

    return data;
  }, []);

  const fetchAdminEditorials = useCallback(async () => {
    const authorizationHeader = getAuthorizationHeader();

    if (!authorizationHeader) {
      throw new Error("관리자 인증 정보가 없습니다. 다시 로그인해주세요.");
    }

    const response = await fetch(`${EDITORIALS_API_URL}/admin/list`, {
      headers: { Authorization: authorizationHeader },
    });
    const data = await response.json();

    if (!response.ok || !Array.isArray(data)) {
      throw new Error(data?.message || "관리자 에디토리얼 목록을 불러오지 못했습니다.");
    }

    return data.map(normalizeEditorial);
  }, []);

  const createEditorial = useCallback(
    async (payload) => {
      const created = normalizeEditorial(
        await requestAdminMutation(`${EDITORIALS_API_URL}/admin`, "POST", payload)
      );
      if (created.status === "published") {
        setEditorials((current) => [...current.filter((item) => item._id !== created._id), created]);
      }
      return created;
    },
    [requestAdminMutation]
  );

  const updateEditorial = useCallback(
    async (id, payload) => {
      const updated = normalizeEditorial(
        await requestAdminMutation(`${EDITORIALS_API_URL}/admin/${id}`, "PUT", payload)
      );
      setEditorials((current) => {
        const withoutCurrent = current.filter((item) => item._id !== updated._id);
        return updated.status === "published" ? [...withoutCurrent, updated] : withoutCurrent;
      });
      return updated;
    },
    [requestAdminMutation]
  );

  const deleteEditorial = useCallback(
    async (id) => {
      await requestAdminMutation(`${EDITORIALS_API_URL}/admin/${id}`, "DELETE");
      setEditorials((current) => current.filter((item) => item._id !== id));
    },
    [requestAdminMutation]
  );

  const reorderEditorials = useCallback(
    async (orderedIds) => {
      const list = await requestAdminMutation(`${EDITORIALS_API_URL}/admin/reorder`, "PUT", {
        orderedIds,
      });
      await refreshEditorials();
      return Array.isArray(list) ? list.map(normalizeEditorial) : [];
    },
    [requestAdminMutation, refreshEditorials]
  );

  const value = useMemo(
    () => ({
      editorials,
      isLoading,
      error,
      refreshEditorials,
      getEditorialBySlug,
      getHomeEditorials,
      fetchAdminEditorials,
      createEditorial,
      updateEditorial,
      deleteEditorial,
      reorderEditorials,
    }),
    [
      createEditorial,
      deleteEditorial,
      editorials,
      error,
      fetchAdminEditorials,
      getEditorialBySlug,
      getHomeEditorials,
      isLoading,
      refreshEditorials,
      reorderEditorials,
      updateEditorial,
    ]
  );

  return <EditorialContext.Provider value={value}>{children}</EditorialContext.Provider>;
}

export function useEditorials() {
  const context = useContext(EditorialContext);

  if (!context) {
    throw new Error("useEditorials must be used within an EditorialProvider");
  }

  return context;
}
