"use strict";

const { findKeyTokenByUserId } = require("../../services/key.service");
const {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} = require("../core/error.response");
const JWT = require("jsonwebtoken");
const { Types } = require("mongoose");

const HEADER = {
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

// Hàm để authentication cho client khi muốn logout
const auth = async (req, res, next) => {
  // 1. Check user id: user id sẽ được định kèm theo header
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) {
    throw new UnauthorizedError("UserID is invalid on HEADER");
  }

  // Kiểm tra userId có phải là ObjectId hợp lệ không
  if (!Types.ObjectId.isValid(userId)) {
    throw new BadRequestError("UserID không hợp lệ (phải là ObjectId)");
  }

  // 2. Get key store (được lấy từ hàm trong key service)
  const keyStored = await findKeyTokenByUserId(userId);
  if (!keyStored) {
    throw new NotFoundError("Do not find key store");
  }

  // 3. Verify cái token
  const authHeader = req.headers[HEADER.AUTHORIZATION];
  if (!authHeader) {
    throw new UnauthorizedError("AccessToken invalid (in authorization)");
  }

  // Kiểm tra định dạng Bearer token
  if (!authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError(
      "Authorization header phải có định dạng Bearer <token>"
    );
  }
  const accessToken = authHeader.split(" ")[1];

  // 4. Check user in db
  try {
    // Với HS256, dùng privateKey để verify
    const decodeUser = JWT.verify(accessToken, keyStored.privateKey);
    if (userId != decodeUser.userId) {
      throw new UnauthorizedError("Invalid user");
    }

    // Gắn keyStored vào req để sử dụng ở các middleware tiếp theo
    req.keyStored = keyStored;
    next();
  } catch (error) {
    console.log(`Error in authentication: `, error);
    throw error;
  }
};

module.exports = {
  auth,
};
