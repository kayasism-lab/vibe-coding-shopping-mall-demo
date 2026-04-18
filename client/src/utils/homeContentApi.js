import { HOME_CONTENT_API_URL, getAuthorizationHeader } from "./auth";
import { parseApiJsonResponse } from "./apiJson";

export async function fetchHomeContentDocument() {
  const response = await fetch(HOME_CONTENT_API_URL);
  const data = await parseApiJsonResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "메인 콘텐츠를 불러오지 못했습니다.");
  }

  return data;
}

export async function saveHomeContentDocument(payload) {
  const authorizationHeader = getAuthorizationHeader();
  if (!authorizationHeader) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(HOME_CONTENT_API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorizationHeader,
    },
    body: JSON.stringify(payload),
  });

  const data = await parseApiJsonResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "저장에 실패했습니다.");
  }

  return data;
}
