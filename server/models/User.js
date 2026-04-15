const mongoose = require("mongoose");
const Address = require("./Address");

const { Schema, model, models } = mongoose;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(02\d{7,8}|0\d{9,10})$/;
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const hashedPasswordPattern = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

// 사용자 기본 정보와 약관 동의 상태를 저장하는 스키마
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => emailPattern.test(value),
        message: "이메일 형식이 올바르지 않습니다.",
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) =>
          passwordPattern.test(value) || hashedPasswordPattern.test(value),
        message: "비밀번호는 8자 이상이며 영문, 숫자, 특수문자를 모두 포함해야 합니다.",
      },
    },
    contact: {
      type: String,
      required: true,
      trim: true,
      set: (value) => value.replace(/\D/g, ""),
      validate: {
        validator: (value) => phonePattern.test(value),
        message: "전화번호 형식이 올바르지 않습니다.",
      },
    },
    requiredTermsAgreed: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 0,
    },
    optionalTermsAgreed: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 0,
    },
    userType: {
      type: String,
      required: true,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

// User 삭제 시 연결된 주소도 함께 삭제하는 cascade 처리
const deleteUserAddresses = async (userId) => {
  if (!userId) {
    return;
  }

  await Address.deleteMany({ userId });
};

// findOneAndDelete 계열 삭제 후 주소를 정리한다.
userSchema.post("findOneAndDelete", async function cascadeDeleteUserAddresses(doc) {
  await deleteUserAddresses(doc?._id);
});

// 문서 단위 deleteOne 삭제 후 주소를 정리한다.
userSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function cascadeDeleteUserAddressesFromDocument() {
    await deleteUserAddresses(this._id);
  }
);

module.exports = models.User || model("User", userSchema);
