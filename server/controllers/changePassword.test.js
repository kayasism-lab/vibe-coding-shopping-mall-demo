/**
 * changePassword 컨트롤러 단위 테스트
 * RED 단계: changePassword 함수가 아직 authController에 없으므로 모든 테스트 실패
 */

const bcrypt = require("bcryptjs");

// User 모델 목킹 — DB 연결 없이 컨트롤러 로직만 검증한다
jest.mock("../models/User");
jest.mock("bcryptjs");

const User = require("../models/User");
const { changePassword } = require("./authController");

// Express req/res 목 헬퍼
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeReq = (body = {}, userId = "user-123") => ({
  user: { userId },
  body,
});

describe("changePassword 컨트롤러", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("현재 비밀번호가 없으면 400을 반환한다", async () => {
    const req = makeReq({ currentPassword: "", newPassword: "New1!pass", confirmPassword: "New1!pass" });
    const res = makeRes();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it("새 비밀번호가 없으면 400을 반환한다", async () => {
    const req = makeReq({ currentPassword: "Old1!pass", newPassword: "", confirmPassword: "" });
    const res = makeRes();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("새 비밀번호와 확인 비밀번호가 다르면 400을 반환한다", async () => {
    const req = makeReq({
      currentPassword: "Old1!pass",
      newPassword: "New1!pass",
      confirmPassword: "Different1!",
    });
    const res = makeRes();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it("새 비밀번호가 유효성 검증을 통과하지 못하면 400을 반환한다", async () => {
    const req = makeReq({
      currentPassword: "Old1!pass",
      newPassword: "weak",
      confirmPassword: "weak",
    });
    const res = makeRes();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("새 비밀번호가 현재 비밀번호와 같으면 400을 반환한다", async () => {
    const req = makeReq({
      currentPassword: "Old1!pass",
      newPassword: "Old1!pass",
      confirmPassword: "Old1!pass",
    });
    const res = makeRes();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/현재 비밀번호와 같을 수 없습니다/) })
    );
  });

  it("사용자를 찾을 수 없으면 404를 반환한다", async () => {
    User.findById = jest.fn().mockResolvedValue(null);

    const req = makeReq({
      currentPassword: "Old1!pass",
      newPassword: "New1!pass",
      confirmPassword: "New1!pass",
    });
    const res = makeRes();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("현재 비밀번호가 틀리면 401을 반환한다", async () => {
    const fakeUser = { _id: "user-123", password: "hashed-old" };
    User.findById = jest.fn().mockResolvedValue(fakeUser);
    bcrypt.compare = jest.fn().mockResolvedValue(false);

    const req = makeReq({
      currentPassword: "WrongOld1!",
      newPassword: "New1!pass",
      confirmPassword: "New1!pass",
    });
    const res = makeRes();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  it("비밀번호 변경에 성공하면 200을 반환하고 비밀번호를 저장한다", async () => {
    const fakeUser = {
      _id: "user-123",
      password: "hashed-old",
      save: jest.fn().mockResolvedValue(undefined),
    };
    User.findById = jest.fn().mockResolvedValue(fakeUser);
    bcrypt.compare = jest.fn().mockResolvedValue(true);
    bcrypt.hash = jest.fn().mockResolvedValue("hashed-new");

    const req = makeReq({
      currentPassword: "Old1!pass",
      newPassword: "New1!pass",
      confirmPassword: "New1!pass",
    });
    const res = makeRes();

    await changePassword(req, res);

    expect(fakeUser.save).toHaveBeenCalled();
    expect(fakeUser.password).toBe("hashed-new");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("JWT 토큰에 userId가 없으면 401을 반환한다", async () => {
    const req = { user: null, body: { currentPassword: "Old1!", newPassword: "New1!pass", confirmPassword: "New1!pass" } };
    const res = makeRes();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
