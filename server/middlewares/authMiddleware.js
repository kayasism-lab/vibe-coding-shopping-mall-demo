const {
  extractBearerToken,
  getJwtAuthErrorMessage,
  resolveAuthenticatedUser,
} = require("../utils/jwtAuth");

// Authorization 헤더의 JWT를 검증하고 요청 사용자 정보를 주입한다.
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "인증 토큰이 필요합니다.",
      });
    }

    if (!extractBearerToken(authHeader)) {
      return res.status(401).json({
        message: "Authorization 헤더는 Bearer 토큰 형식이어야 합니다.",
      });
    }

    // 토큰이 유효하면 payload를 이후 라우트에서 사용할 수 있게 저장한다.
    req.user = resolveAuthenticatedUser(authHeader);

    return next();
  } catch (error) {
    return res.status(401).json({
      message: getJwtAuthErrorMessage(error),
    });
  }
};

// 토큰이 있을 때만 해석하고, 없어도 요청을 통과시킨다.
const attachUserIfTokenPresent = (req, _res, next) => {
  try {
    req.user = resolveAuthenticatedUser(req.headers.authorization);
  } catch {
    req.user = null;
  }

  return next();
};

module.exports = {
  authenticateToken,
  attachUserIfTokenPresent,
};
