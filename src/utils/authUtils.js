"use strict";

const JWT = require("jsonwebtoken");

// Payload: Chính là những thông tin mã hóa vào token
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // Access token: Tạo thông qua private key
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256", // Thuật toán
      expiresIn: "1 days", // Thời gian sống
    });

    // Refresh token: Tạo thông qua private key
    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });

    // Verify token bằng public key (decode): Như đã nói ở hàm signUp, phải dùng chính cái public key
    // được lưu trong db để verify AT được ký bởi private key
    JWT.verify(accessToken, publicKey, (error, decode) => {
      if (error) {
        console.error(`Error verify ${error}`);
      } else {
        console.log(`Decode::`, decode);    
      }
    });

    // Trả về cặp token
    return { accessToken, refreshToken };
  } catch (error) {}
};

module.exports = {
  createTokenPair,
};
