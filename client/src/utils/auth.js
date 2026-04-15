export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const LOGIN_API_URL = `${API_BASE_URL}/api/auth/login`;
export const AUTH_ME_API_URL = `${API_BASE_URL}/api/auth/me`;
export const USERS_API_URL = `${API_BASE_URL}/api/users`;
export const ORDERS_API_URL = `${API_BASE_URL}/api/orders`;
export const PAYMENTS_API_URL = `${API_BASE_URL}/api/payments`;
export const MY_ORDERS_API_URL = `${ORDERS_API_URL}/mine`;
export const PRODUCTS_API_URL = `${API_BASE_URL}/api/products`;

export const getStoredSession = () => {
  try {
    const rawSession = localStorage.getItem("authSession");
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
};

export const persistSession = (session) => {
  if (!session) {
    return;
  }

  localStorage.setItem("authSession", JSON.stringify(session));

  if (session.token) {
    localStorage.setItem("authToken", session.token);
  }

  if (session.user) {
    localStorage.setItem("authUser", JSON.stringify(session.user));
  }
};

export const clearStoredSession = () => {
  localStorage.removeItem("authSession");
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
};

export const getAuthToken = () => {
  const storedToken = localStorage.getItem("authToken");

  if (storedToken) {
    return storedToken;
  }

  const storedSession = getStoredSession();
  return storedSession?.token || null;
};

export const getAuthorizationHeader = () => {
  const storedSession = getStoredSession();
  const storedToken = getAuthToken();

  if (!storedSession || !storedToken) {
    return null;
  }

  return `${storedSession.tokenType || "Bearer"} ${storedToken}`;
};

export const fetchCurrentUser = async ({ token, tokenType = "Bearer" }) => {
  const meResponse = await fetch(AUTH_ME_API_URL, {
    method: "GET",
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
  });

  const contentType = meResponse.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await meResponse.json() : null;

  if (!meResponse.ok || !data?.user) {
    throw new Error(data?.message || "사용자 정보를 불러오지 못했습니다.");
  }

  return data.user;
};

export const refreshStoredSession = async () => {
  const storedSession = getStoredSession();
  const storedToken = localStorage.getItem("authToken");

  if (!storedSession || !storedToken) {
    return null;
  }

  const user = await fetchCurrentUser({
    token: storedToken,
    tokenType: storedSession.tokenType || "Bearer",
  });

  const nextSession = {
    ...storedSession,
    token: storedToken,
    user,
    authIdentity: user,
  };

  persistSession(nextSession);
  return nextSession;
};
