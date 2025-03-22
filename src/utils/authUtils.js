"use strict";

const JWT = require("jsonwebtoken");
const crypto = require("crypto");

// Hàm tạo ra cặp khóa public key và private key: Sử dụng giải thuật RSA bất đối xứng
const createKeyPair = async () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
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

// Hàm tạo cặp khóa sử dụng giải thuật khóa đối xứng
const createKeyPairUsingBase64 = async () => {
  const publicKey = crypto.randomBytes(64).toString("hex");
  const privateKey = crypto.randomBytes(64).toString("hex");
  return { publicKey, privateKey };
};

// Payload: Chính là những thông tin mã hóa vào token
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // Thay RS256 thành HS256 để sử dụng khóa đối xứng
    const accessToken = JWT.sign(payload, privateKey, {
      algorithm: "HS256",
      expiresIn: "1d",
    });
    console.log("AccessToken created:", accessToken);

    const refreshToken = JWT.sign(payload, privateKey, {
      algorithm: "HS256",
      expiresIn: "7d",
    });
    console.log("RefreshToken created:", refreshToken);

    // Thử verify xem có đúng với ban đầu đã truyền vào không
    // Verify (giải mã) bằng publicKey, vì khi ký (mã hóa) thì ký bằng privateKey
    JWT.verify(accessToken, publicKey, (error, decode) => {
      if (error) {
        console.error(`Error verify ${error}`);
      } else {
        console.log(`Decode::`, decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in createTokenPair:", error);
    throw error;
  }
};

module.exports = {
  createTokenPair,
  createKeyPairUsingBase64,
  createKeyPair,
};
