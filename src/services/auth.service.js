"use strict";

const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const KeyService = require("./key.service");
const { createTokenPair } = require("../utils/authUtils");
const { getIntoData } = require("../utils/lodasUtils");

// Định nghĩa role
const RoleShop = {
  USER: "0000",
  WRITE: "0001",
  READ: "0002",
  EDIT: "0003",
};

class AuthService {
  static signUp = async ({ name, email, password }) => {
    try {
      // Check email already exits || lean() sẽ giúp query nhanh hơn
      const existedUser = await userModel.findOne({ email }).lean();

      if (existedUser) {
        return {
          code: "xxx",
          message: "User already existed in database.",
        };
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

        // Tạo xong thì save vào collection KeyStore
        const publicKeyString = KeyService.createToken({
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

          publicKeyString,
          privateKey
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
    } catch (err) {
      return {
        code: "xxx",
        message: err.message,
        status: "ERROR",
      };
    }
  };
}

module.exports = AuthService;
