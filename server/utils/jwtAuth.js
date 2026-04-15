const jwt = require("jsonwebtoken");

const parseAuthorizationHeader = (authHeader) => {
  if (!authHeader) {
    return { scheme: null, token: null };
  }

  const [scheme, token] = authHeader.split(" ");
  return { scheme, token };
};

const verifyJwtToken = (token, secret = process.env.JWT_SECRET) => jwt.verify(token, secret);

const extractBearerToken = (authHeader) => {
  const { scheme, token } = parseAuthorizationHeader(authHeader);

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const getJwtAuthErrorMessage = (error) => {
  if (error?.name === "TokenExpiredError") {
    return "토큰이 만료되었습니다. 다시 로그인해주세요.";
  }

  return "유효하지 않은 토큰입니다.";
};

const resolveAuthenticatedUser = (authHeader) => {
  const token = extractBearerToken(authHeader);

  if (!token) {
    return null;
  }

  return verifyJwtToken(token);
};

module.exports = {
  parseAuthorizationHeader,
  verifyJwtToken,
  extractBearerToken,
  getJwtAuthErrorMessage,
  resolveAuthenticatedUser,
};
