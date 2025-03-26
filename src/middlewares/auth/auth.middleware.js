"use strict";

// Đây là nơi verify tài khoảng dựa vào bearer token (AT) trước khi req đi vào hệ thống
// Đây ở middleware

const { findKeyTokenByShopId } = require("../../services/key.service");
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
    const shopId = req.headers[HEADER.CLIENT_ID];
    if (!shopId) {
      throw new UnauthorizedError("ShopID is invalid on HEADER");
    }

    if (!Types.ObjectId.isValid(shopId)) {
      throw new BadRequestError("ShopID invalid (must be ObjectId)");
    }

    const keyStored = await findKeyTokenByShopId(shopId);
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

    const decodeShop = JWT.verify(accessToken, keyStored.publicKey, {
      algorithms: ["RS256"],
    });
    console.log("Decoded shop:", decodeShop);
    if (shopId != decodeShop.shopId) {
      throw new UnauthorizedError("Invalid shop");
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
