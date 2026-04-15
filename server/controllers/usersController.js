const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Address = require("../models/Address");

const userFields = [
  "email",
  "name",
  "password",
  "contact",
  "requiredTermsAgreed",
  "optionalTermsAgreed",
  "userType",
];
const addressFields = ["label", "address", "order"];

// 요청 본문에서 허용된 필드만 골라낸다.
const pickFields = (source, fields) =>
  fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }

    return result;
  }, {});

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);
const SALT_ROUNDS = 10;

// Mongoose validation 에러를 사용자 메시지로 정리한다.
const getValidationMessage = (error) => {
  if (error?.name !== "ValidationError") {
    return null;
  }

  return Object.values(error.errors)
    .map((detail) => detail.message)
    .join(" ");
};

// 사용자 단건 조회 시 주소까지 함께 묶어서 반환한다.
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

// 회원가입 시 함께 들어온 주소 payload를 사전 검증한다.
const validateAddressPayloads = (addresses) => {
  for (const address of addresses) {
    if (!address?.address || !String(address.address).trim()) {
      return "주소를 입력해주세요.";
    }

    if (!address?.label || !String(address.label).trim()) {
      return "주소 별칭은 한 글자 이상 입력해주세요.";
    }
  }

  return null;
};

// 비밀번호가 포함된 경우 bcrypt 해시로 변환한다.
const hashPasswordIfPresent = async (payload) => {
  if (!payload.password) {
    return payload;
  }

  return {
    ...payload,
    password: await bcrypt.hash(payload.password, SALT_ROUNDS),
  };
};

// 전체 사용자 목록과 각 사용자 주소를 함께 조회한다.
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    const userIds = users.map((user) => user._id);
    const addresses = await Address.find({ userId: { $in: userIds } })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    const addressesByUserId = addresses.reduce((result, address) => {
      const key = String(address.userId);
      result[key] = result[key] || [];
      result[key].push(address);
      return result;
    }, {});

    res.json(
      users.map((user) => ({
        ...user,
        addresses: addressesByUserId[String(user._id)] || [],
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "유저 목록 조회에 실패했습니다.", error: error.message });
  }
};

// 사용자 한 명의 상세 정보와 주소를 조회한다.
const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
    }

    const user = await getUserWithAddresses(userId);

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "유저 조회에 실패했습니다.", error: error.message });
  }
};

// 회원가입 처리: 사용자 생성 후 필요한 주소도 함께 생성한다.
const createUser = async (req, res) => {
  let user = null;

  try {
    let userPayload = pickFields(req.body, userFields);
    const addressPayloads = Array.isArray(req.body.addresses) ? req.body.addresses : [];
    const addressValidationMessage = validateAddressPayloads(addressPayloads);

    if (addressValidationMessage) {
      return res.status(400).json({ message: addressValidationMessage });
    }

    userPayload = await hashPasswordIfPresent(userPayload);
    user = await User.create(userPayload);

    if (addressPayloads.length > 0) {
      const preparedAddresses = addressPayloads.map((address) => ({
        ...pickFields(address, addressFields),
        userId: user._id,
      }));

      for (const address of preparedAddresses) {
        await Address.create(address);
      }
    }

    const createdUser = await getUserWithAddresses(user._id);
    res.status(201).json(createdUser);
  } catch (error) {
    if (user?._id) {
      await Address.deleteMany({ userId: user._id });
      await User.findByIdAndDelete(user._id);
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
    }

    const validationMessage = getValidationMessage(error);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    res.status(400).json({ message: "유저 생성에 실패했습니다.", error: error.message });
  }
};

// 사용자 기본 정보를 수정하고 최신 주소 목록을 함께 반환한다.
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
    }

    let updates = pickFields(req.body, userFields);
    updates = await hashPasswordIfPresent(updates);

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();

    if (!updatedUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const addresses = await Address.find({ userId })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.json({ ...updatedUser, addresses });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
    }

    const validationMessage = getValidationMessage(error);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    res.status(400).json({ message: "유저 수정에 실패했습니다.", error: error.message });
  }
};

// 사용자 삭제 요청을 처리한다. 주소 삭제는 User 모델의 cascade 훅이 담당한다.
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
    }

    const deletedUser = await User.findByIdAndDelete(userId).select("-password").lean();

    if (!deletedUser) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.json({ message: "사용자와 연결된 주소가 삭제되었습니다.", user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: "유저 삭제에 실패했습니다.", error: error.message });
  }
};

// 특정 사용자의 주소 목록만 조회한다.
const getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
    }

    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const addresses = await Address.find({ userId })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: "주소 목록 조회에 실패했습니다.", error: error.message });
  }
};

// 특정 사용자에게 새 주소를 추가한다.
const createUserAddress = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
    }

    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const address = await Address.create({
      ...pickFields(req.body, addressFields),
      userId,
    });

    res.status(201).json(address);
  } catch (error) {
    res.status(400).json({ message: "주소 생성에 실패했습니다.", error: error.message });
  }
};

// 특정 사용자의 주소 한 건을 수정한다.
const updateUserAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (!isValidId(userId) || !isValidId(addressId)) {
      return res.status(400).json({ message: "유효하지 않은 ID입니다." });
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      pickFields(req.body, addressFields),
      { new: true, runValidators: true }
    ).lean();

    if (!updatedAddress) {
      return res.status(404).json({ message: "주소를 찾을 수 없습니다." });
    }

    res.json(updatedAddress);
  } catch (error) {
    res.status(400).json({ message: "주소 수정에 실패했습니다.", error: error.message });
  }
};

// 특정 사용자의 주소 한 건을 삭제한다.
const deleteUserAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (!isValidId(userId) || !isValidId(addressId)) {
      return res.status(400).json({ message: "유효하지 않은 ID입니다." });
    }

    const deletedAddress = await Address.findOneAndDelete({ _id: addressId, userId }).lean();

    if (!deletedAddress) {
      return res.status(404).json({ message: "주소를 찾을 수 없습니다." });
    }

    res.json({ message: "주소가 삭제되었습니다.", address: deletedAddress });
  } catch (error) {
    res.status(500).json({ message: "주소 삭제에 실패했습니다.", error: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
};
