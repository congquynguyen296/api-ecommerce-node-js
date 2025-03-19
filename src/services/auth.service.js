"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userModel = require("../models/user.model");
const KeyService = require("./key.service");

const { createTokenPair } = require("../utils/authUtils");
const { getIntoData } = require("../utils/lodasUtils");
const { ConflictRequestError } = require("../middlewares/core/error.response");

// Định nghĩa role
const RoleShop = {
  USER: "0000",
  WRITE: "0001",
  READ: "0002",
  EDIT: "0003",
};

class AuthService {
  static signUp = async ({ name, email, password }) => {
    // Check email already exits || lean() sẽ giúp query nhanh hơn
    const existedUser = await userModel.findOne({ email }).lean();

    if (existedUser) {
      throw new ConflictRequestError();
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Created if not existed
    const newUser = await userModel.create({
      name: name,
      email: email,
      password: passwordHash,
      roles: [RoleShop.USER],
    });

    // Khi tạo thành công sẽ có được refresh token và access token
    if (newUser) {
      // Tạo private key và public key (theo quy chuẩn)
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
      console.log(`Private key:\n${privateKey}\nPublic key:\n${publicKey}`);

      // === GÓC LÝ THUYẾT ===
      // AT và RT đều được ký bằng private key. Do đó cần một public key tương ứng (được tạo đồng thời)
      // với private key đó để verify. Nên cần lưu lại public key này vào db để khi client gửi req (có
      // đính kèm AT hoặc RT) thì server sẽ dùng chính public key này để xác nhận chữ ký.

      // Private key chỉ dùng để ký và tạo token mới, không dùng để mã hóa
      // Public key chỉ dùng để verify token do private key tạo ra, không dùng để giải mã

      // Public key không giúp phát hiện đánh cắp: Public key chỉ verify tính toàn vẹn và nguồn gốc
      // (token do server tạo), không kiểm tra "ai đang dùng token" hay "token có bị lộ không".
      // === === === === === ===

      // Tạo xong thì save vào collection KeyStore
      const publicKeyString = KeyService.storePublicKey({
        userId: newUser._id, // Đây là biến id của database
        publicKey: publicKey,
      }); // Gọi lại bên module key

      // Nếu gen không thành công thì dừng nghiệp vụ
      if (!publicKeyString) {
        return {
          code: "xxx",
          message: "Can not generate public key (string)",
          status: "ERROR",
        };
      }

      // Tạo cặp access token và refresh token đẩy về cho user -> Đăng ký user thành công
      const tokens = await createTokenPair(
        { userId: newUser._id, email: newUser.email }, // Payload truyền vào những gì thì khi decode
        // ra sẽ nhận được tương ứng. Còn trường iat và exp là do thư viện jsonwebtoken tự động thêm

        publicKeyString, // Và public key được lưu lại này sẽ xác nhận chữ ký
        privateKey // Đây là private dùng để tạo chữ ký như đã nói ở trên
      );
      console.log(`Created tokens::`, tokens);
      return {
        code: 201,
        metadata: {
          user: getIntoData({
            object: newUser,
            fields: ["_id", "name", "email", "password"],
          }),
          tokens: tokens,
        },
      };
    }
  };
}

// Export class để bên import tự quyết định cách dùng
module.exports = AuthService;
