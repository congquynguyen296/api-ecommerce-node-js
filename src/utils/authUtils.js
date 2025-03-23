"use strict";

const JWT = require("jsonwebtoken");
const crypto = require("crypto");

// Hàm tạo ra cặp khóa public key và private key: Sử dụng giải thuật RSA bất đối xứng
const createKeyPair = async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
  return { publicKey, privateKey };
};

// Hàm tạo khóa sử dụng giải thuật khóa đối xứng
const createKeyPairUsingBase64 = async () => {
  const secretKey = crypto.randomBytes(64).toString("hex");
  return { secretKey };
};

// Payload: Chính là những thông tin mã hóa vào token
const createTokenPair = async (payload, privateKey) => {
  try {
    // Thay RS256 thành HS256 để sử dụng khóa đối xứng
    const accessToken = JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1d",
    });
    console.log("AccessToken created:", accessToken);

    const refreshToken = JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7d",
    });
    console.log("RefreshToken created:", refreshToken);

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in createTokenPair:", error);
    throw error;
  }
};

// Hàm để verify JWT: secret là public key nếu thuật toán mã hóa là RSA
const verifyJWT = async (token, secretKey) => {
  try {
    const decode = JWT.verify(token, secretKey, { algorithms: ["RS256"] });
    console.log(decode);
    return decode;
  } catch (error) {
    console.error("Error verifying JWT:", error.message);
    throw new UnauthorizedError("Invalid token");
  }
};

module.exports = {
  createTokenPair,
  createKeyPairUsingBase64,
  createKeyPair,
  verifyJWT,
};
