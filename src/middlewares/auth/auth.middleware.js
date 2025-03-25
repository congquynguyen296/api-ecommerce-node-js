"use strict";

// Đây là nơi verify tài khoảng dựa vào bearer token (AT) trước khi req đi vào hệ thống
// Đây ở middleware

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

// Hàm để authentication cho client khi muốn truy cập vào tài nguyên hệ thống
const auth = async (req, res, next) => {
  try {
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) {
      throw new UnauthorizedError("UserID is invalid on HEADER");
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestError("UserID invalid (must be ObjectId)");
    }

    const keyStored = await findKeyTokenByUserId(userId);
    if (!keyStored) {
      throw new NotFoundError("Do not find key store");
    }

    const authHeader = req.headers[HEADER.AUTHORIZATION];
    if (!authHeader) {
      throw new UnauthorizedError("AccessToken invalid (in authorization)");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Authorization header must be Bearer <token>"
      );
    }
    const accessToken = authHeader.split(" ")[1];

    const decodeUser = JWT.verify(accessToken, keyStored.publicKey, {
      algorithms: ["RS256"],
    });
    console.log("Decoded user:", decodeUser);
    if (userId != decodeUser.userId) {
      throw new UnauthorizedError("Invalid user");
    }

    req.keyStored = keyStored;
    next();
  } catch (error) {
    console.log(`Error in authentication: `, error);
    next(error);
  }
};

module.exports = {
  auth,
};
