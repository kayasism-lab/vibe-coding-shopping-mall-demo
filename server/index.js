const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const editorialRoutes = require("./routes/editorials");
const orderRoutes = require("./routes/orders");
const productRoutes = require("./routes/products");
const paymentRoutes = require("./routes/payments");
const homeContentRoutes = require("./routes/homeContent");
const { ensureSeedData } = require("./utils/seedData");

const app = express();
const PORT = process.env.PORT || 5000;
const atlasMongoUri = process.env.MONGODB_ATLAS_URL?.trim();
const MONGO_URI = atlasMongoUri || "mongodb://127.0.0.1:27017/shopping_mall_demo";
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;

const getMongoConnectionHint = (error) => {
  const message = error?.message || "";

  if (message.includes("querySrv")) {
    return "Atlas SRV DNS 조회에 실패했습니다. 현재 네트워크/DNS 환경에서 `mongodb+srv://`를 해석하지 못할 수 있습니다.";
  }

  if (message.includes("bad auth") || message.includes("Authentication failed")) {
    return "MongoDB 인증에 실패했습니다. Atlas 사용자명/비밀번호와 DB 접근 권한을 확인해주세요.";
  }

  if (message.includes("ECONNREFUSED")) {
    return "MongoDB 서버에 연결할 수 없습니다. Atlas 네트워크 접근 허용 또는 로컬 MongoDB 실행 상태를 확인해주세요.";
  }

  return "";
};

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET 환경 변수가 필요합니다.");
}

if (!JWT_EXPIRES_IN) {
  throw new Error("JWT_EXPIRES_IN 환경 변수가 필요합니다.");
}

if (!TOSS_SECRET_KEY) {
  throw new Error("TOSS_SECRET_KEY 환경 변수가 필요합니다.");
}

// 공통 미들웨어와 기능별 API 라우터를 등록한다.
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/editorials", editorialRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/home-content", homeContentRoutes);

// 서버 동작 확인용 기본 엔드포인트
app.get("/", (req, res) => {
  res.json({ message: "Server is running." });
});

// 헬스 체크용 엔드포인트
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 애플리케이션 시작 전 MongoDB 연결을 수행한다.
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB 연결 성공하였습니다");
  } catch (error) {
    console.error("MongoDB 연결 실패");
    console.error(`연결 대상: ${atlasMongoUri ? "MONGODB_ATLAS_URL" : "local MongoDB"}`);
    console.error(`원인: ${error.message}`);

    const connectionHint = getMongoConnectionHint(error);
    if (connectionHint) {
      console.error(`힌트: ${connectionHint}`);
    }

    process.exit(1);
  }
};

// DB 연결이 완료된 뒤 Express 서버를 실행하고 기본 샘플 데이터까지 준비한다.
const startServer = async () => {
  await connectDB();
  await ensureSeedData();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer();
