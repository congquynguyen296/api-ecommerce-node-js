"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userModel = require("../models/user.model");
const KeyService = require("./key.service");

const {
  createTokenPair,
  createKeyPairUsingBase64,
  createKeyPair,
} = require("../utils/authUtils");
const { getIntoData } = require("../utils/lodasUtils");
const {
  ConflictRequestError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../middlewares/core/error.response");
const UserService = require("./user.service");
const {
  OkResponse,
  CreatedResponse,
} = require("../middlewares/core/success.response");

// Định nghĩa role
const RoleShop = {
  USER: "0000",
  WRITE: "0001",
  READ: "0002",
  EDIT: "0003",
};

class AuthService {
  // 1. Hàm đăng ký tạo tài khoản:
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
      // Dùng giải thuật RSA bất đối xứng
      // const { privateKey, publicKey } = await createKeyPair();

      // Dùng giải thuật mã hóa đối xứng
      const { publicKey, privateKey } = createKeyPairUsingBase64();
      if (!privateKey || !publicKey) {
        throw new BadRequestError("Failed to generate key pair");
      }
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
      const publicKeyString = await KeyService.storeAndUpdateKeyToken({
        userId: newUser._id, // Đây là biến id của database
        publicKey: publicKey,
        privateKey: privateKey,
        // Khi mới đk sẽ chưa có refresh token, refresh token sẽ được lưu khi ng đùng đăng nhập lần đầu
      }); // Gọi lại bên module key

      // Nếu gen không thành công thì dừng nghiệp vụ
      if (!publicKeyString) {
        throw new BadRequestError("Can not generate public key");
      }

      // Tạo cặp access token và refresh token đẩy về cho user -> Đăng ký user thành công
      const tokens = await createTokenPair(
        { userId: newUser._id, email: newUser.email }, // Payload truyền vào những gì thì khi decode
        // ra sẽ nhận được tương ứng. Còn trường iat và exp là do thư viện jsonwebtoken tự động thêm

        publicKeyString, // Và public key được lưu lại này sẽ xác nhận chữ ký
        privateKey // Đây là private dùng để tạo chữ ký như đã nói ở trên
      );

      return new CreatedResponse({
        message: "Registed success",
        metadata: {
          user: getIntoData({
            object: newUser,
            fields: ["_id", "name", "email", "password"],
          }),
          tokens: tokens,
        },
      });
    }
  };

  // 2. Hàm đăng nhập:
  // Quá trình:
  /*
    2.1. Check email in db
    2.2. Match password
    2.3. Create AT + RT and save in db
    2.4. Generate token
    2.5. Get data and login
  */
  static signIn = async ({ email, password, refreshToken }) => {
    // Check email
    const exitedUser = await UserService.findOneByEmail({ email });
    console.log(`USER::`, exitedUser);
    if (!exitedUser) throw new NotFoundError("User not registed");

    // Check password
    const isMatch = bcrypt.compare(password, exitedUser.password);
    if (!isMatch) throw new UnauthorizedError("Password is unvalid");

    // Create AT + RT and save in db
    const { privateKey, publicKey } = await createKeyPairUsingBase64();
    if (!privateKey || !publicKey) {
      throw new BadRequestError("Can not generate key");
    }

    const tokens = await createTokenPair(
      { userId: exitedUser._id, email: exitedUser.email },
      publicKey,
      privateKey
    );

    const publicKeyStored = await KeyService.storeAndUpdateKeyToken({
      userId: exitedUser._id,
      publicKey: publicKey,
      privateKey: privateKey,
      refreshToken: tokens.refreshToken,
    });

    // Đã viết handle response nên viết kiểu này
    return new OkResponse({
      message: "Login successful",
      metadata: {
        user: getIntoData({
          object: exitedUser,
          fields: ["_id", "name", "email", "password"],
        }),
        tokens: tokens,
      },
    });
  };
  
  
  static logout = async (keyStored) => {
    const deleteKeyToken = KeyService.removeKeyTokenById(keyStored._id);
    console.log(`DeleteKeyToken::`, deleteKeyToken);
    return deleteKeyToken;
  };

  static handleRefreshToken = async (refreshToken) => {
    
    // 1. Kiểm tra sự tồn tại
    const existedRefreshToken = KeyService.findByRefreshTokenUsed(refreshToken);
    if (existedRefreshToken) {
      // 2. Decode token xem có trong hệ thống hay không
      
    }
  }
}

// Export class để bên import tự quyết định cách dùng
module.exports = AuthService;
