const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Address = require("../models/Address");
const { getPasswordValidationMessage } = require("../utils/passwordUtils");

const getJwtConfig = () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
});
const PASSWORD_SALT_ROUNDS = 10;

// 로그인 성공 시 사용자 정보와 주소를 함께 내려주기 위한 헬퍼
const getUserWithAddresses = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    return null;
  }

  const addresses = await Address.find({ userId })
    .sort({ isDefault: -1, order: 1, createdAt: 1 })
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
    });
  }
};

// 인증된 사용자가 본인의 비밀번호를 변경한다.
const changePassword = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "인증 정보가 없습니다." });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 필수 입력 값 검증
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "현재 비밀번호, 새 비밀번호, 새 비밀번호 확인을 모두 입력해주세요." });
    }

    // 새 비밀번호 일치 여부 확인
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "새 비밀번호는 현재 비밀번호와 같을 수 없습니다." });
    }

    // 새 비밀번호 정책 검증
    const validationError = getPasswordValidationMessage(newPassword);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 현재 비밀번호가 올바른지 확인한다
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "현재 비밀번호가 올바르지 않습니다." });
    }

    // 새 비밀번호를 해시화하여 저장한다
    user.password = await bcrypt.hash(newPassword, PASSWORD_SALT_ROUNDS);
    await user.save();

    return res.status(200).json({ message: "비밀번호가 변경되었습니다." });
  } catch (error) {
    return res.status(500).json({
      message: "비밀번호 변경 처리에 실패했습니다.",
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
  changePassword,
};
