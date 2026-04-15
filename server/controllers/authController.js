const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Address = require("../models/Address");

const getJwtConfig = () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
});

// 로그인 성공 시 사용자 정보와 주소를 함께 내려주기 위한 헬퍼
const getUserWithAddresses = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    return null;
  }

  const addresses = await Address.find({ userId })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  return { ...user, addresses };
};

// 이메일/비밀번호 로그인 후 JWT 토큰을 발급한다.
const login = async (req, res) => {
  try {
    const { secret, expiresIn } = getJwtConfig();
    const email = req.body.email?.trim()?.toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        message: "이메일과 비밀번호를 모두 입력해주세요.",
      });
    }

    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(401).json({
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    // 저장된 해시 비밀번호와 입력 비밀번호를 비교한다.
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const userWithAddresses = await getUserWithAddresses(user._id);
    // 로그인 성공 시 프론트가 사용할 JWT 토큰을 발급한다.
    const token = jwt.sign(
      {
        userId: String(user._id),
        email: user.email,
        userType: user.userType,
      },
      secret,
      { expiresIn }
    );

    return res.status(200).json({
      message: "로그인에 성공했습니다.",
      token,
      tokenType: "Bearer",
      expiresIn,
      user: userWithAddresses,
    });
  } catch (error) {
    return res.status(500).json({
      message: "로그인 처리에 실패했습니다.",
      error: error.message,
    });
  }
};

// JWT에 담긴 사용자 ID를 기준으로 현재 로그인 사용자 정보를 조회한다.
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "토큰에 사용자 정보가 없습니다.",
      });
    }

    const user = await getUserWithAddresses(userId);

    if (!user) {
      return res.status(404).json({
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({
      message: "사용자 정보를 조회했습니다.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "사용자 정보 조회에 실패했습니다.",
      error: error.message,
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
};
