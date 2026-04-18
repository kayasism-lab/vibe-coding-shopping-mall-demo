/**
 * fetch 응답이 JSON인지 확인하고 파싱한다.
 * Vercel 등에서 /api 가 index.html 로 떨어지면 <DOCTYPE ... 이 오므로 안내 메시지를 던진다.
 */
export async function parseApiJsonResponse(response) {
  const text = await response.text();
  const trimmed = text.trim();

  if (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<HTML")
  ) {
    throw new Error(
      "API가 JSON 대신 HTML(페이지)을 반환했습니다. Vercel에는 보통 클라이언트만 올라가므로, " +
        "Project Settings → Environment Variables 에서 VITE_API_BASE_URL 을 Node(Express) API 서버의 https 베이스 URL로 설정한 뒤 " +
        "프론트를 다시 빌드·배포해야 합니다. 같은 vercel.app 주소를 VITE_API_BASE_URL 로 두면 이 오류가 납니다."
    );
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
