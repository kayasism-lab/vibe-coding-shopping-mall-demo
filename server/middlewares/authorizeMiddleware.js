// 관리자 여부를 검사하는 공통 권한 미들웨어
const authorizeAdmin = (req, res, next) => {
  if (req.user?.userType !== "admin") {
    return res.status(403).json({ message: "관리자 권한이 필요합니다." });
  }

  return next();
};

// 본인 또는 관리자만 접근 가능한 요청을 검사한다.
const authorizeSelfOrAdmin = (paramKey = "userId") => (req, res, next) => {
  const targetUserId = req.params?.[paramKey];
  const authenticatedUserId = req.user?.userId;
  const isAdmin = req.user?.userType === "admin";

  if (!authenticatedUserId) {
    return res.status(401).json({ message: "인증된 사용자 정보가 없습니다." });
  }

  if (!isAdmin && String(targetUserId) !== String(authenticatedUserId)) {
    return res.status(403).json({ message: "본인 정보에만 접근할 수 있습니다." });
  }

  return next();
};

module.exports = {
  authorizeAdmin,
  authorizeSelfOrAdmin,
};
