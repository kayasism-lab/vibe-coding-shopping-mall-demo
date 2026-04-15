const mongoose = require("mongoose");

const { Schema, model, models } = mongoose;

// 사용자별 배송지 정보를 저장하는 스키마
const addressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// 사용자별 주소 조회/정렬 성능을 위한 인덱스
addressSchema.index({ userId: 1, order: 1 });

// 새 주소 생성 시 사용자 기준 다음 순번을 자동으로 부여한다.
addressSchema.pre("validate", async function setOrder() {
  if (!this.isNew || this.order != null) {
    return;
  }

  const lastAddress = await this.constructor
    .findOne({ userId: this.userId })
    .sort({ order: -1 })
    .select("order")
    .lean();

  this.order = lastAddress ? lastAddress.order + 1 : 1;
});

module.exports = models.Address || model("Address", addressSchema);
