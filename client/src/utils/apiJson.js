/**
 * fetch 응답이 JSON인지 확인하고 파싱한다.
 * Vercel에서 /api 가 404 HTML·index.html 이 오면 <DOCTYPE ... 으로 파싱 실패한다.
 */
export async function parseApiJsonResponse(response) {
  const text = await response.text();
  const trimmed = text.trim();
  const requestUrl = response.url || "";

  const isHtml =
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<HTML");

  if (isHtml) {
    let detail =
      "API가 JSON 대신 HTML 페이지를 받았습니다. ";

    if (typeof window !== "undefined" && requestUrl) {
      try {
        const u = new URL(requestUrl);
        if (u.origin === window.location.origin && u.pathname.startsWith("/api/")) {
          detail +=
            "요청이 백엔드가 아니라 이 사이트(브라우저 주소와 같은 출처)로만 나갔습니다. " +
            "Vercel의 Production 환경 변수 VITE_API_BASE_URL(Cloudtype 등 API https 주소, 끝 슬래시 없이)이 " +
            "**빌드 시점**에 들어가야 합니다. 저장만 하고 재배포하지 않으면 이전 번들이 그대로입니다. ";
        }
      } catch {
        // ignore URL parse errors
      }
    }

    detail +=
      "그 밖에 확인: API 주소 오타·베이스 URL 끝의 /로 인한 잘못된 경로, 또는 서버에 최신 코드(/api/home-content) 미배포.";

    throw new Error(`${detail}${requestUrl ? ` — 실패한 요청: ${requestUrl}` : ""}`);
  }

  if (!trimmed) {
    return {};
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error("서버 응답이 올바른 JSON이 아닙니다.");
  }
}
