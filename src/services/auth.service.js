"use strict";

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userModel = require("../models/user.model");
const KeyService = require("./key.service");

const {
  createTokenPair,
  createKeyPairUsingBase64,
  createKeyPair,
  verifyJWT,
} = require("../utils/authUtils");
const { getIntoData } = require("../utils/lodasUtils");
const {
  ConflictRequestError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
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
      throw new ConflictRequestError("Email already existed");
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
      const { publicKey, privateKey } = await createKeyPair();

      // Dùng giải thuật mã hóa đối xứng
      // const { publicKey, privateKey } = createKeyPairUsingBase64();

      if (!privateKey || !publicKey) {
        return new BadRequestError("Failed to generate key pair");
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

      // Tạo cặp access token và refresh token đẩy về cho user -> Đăng ký user thành công
      const tokens = await createTokenPair(
        { userId: newUser._id, email: newUser.email }, // Payload truyền vào những gì thì khi decode
        // ra sẽ nhận được tương ứng. Còn trường iat và exp là do thư viện jsonwebtoken tự động thêm

        privateKey // Đây là private dùng để tạo chữ ký như đã nói ở trên
      );

      // Tạo xong thì save vào collection KeyStore
      const keyToken = await KeyService.storeAndUpdateKeyTokenByUserId({
        userId: newUser._id, // Đây là biến id của database
        publicKey: publicKey,
        privateKey: privateKey,
        refreshToken: tokens.refreshToken,
        // Khi mới đk sẽ chưa có refresh token, refresh token sẽ được lưu khi ng đùng đăng nhập lần đầu
      }); // Gọi lại bên module key

      // Nếu gen không thành công thì dừng nghiệp vụ
      if (!keyToken) {
        throw new BadRequestError("Can not generate token");
      }

      return new CreatedResponse({
        message: "Registed success",
        metadata: {
          user: getIntoData({
            object: newUser,
            fields: ["_id", "name", "email", "password"],
          }),
          refreshToken: keyToken.refreshToken,
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
    if (!exitedUser) throw new NotFoundError("User not registed");

    // Check password
    const isMatch = bcrypt.compare(password, exitedUser.password);
    if (!isMatch) throw new UnauthorizedError("Password is unvalid");

    // Create AT + RT and save in db: Dùng giải thuật bất đối xứng
    // const { privateKey, publicKey } = await createKeyPairUsingBase64();
    const { publicKey, privateKey } = await createKeyPair();
    if (!privateKey || !publicKey) {
      throw new InternalServerError("Do not create key pair");
    }

    const tokens = await createTokenPair(
      { userId: exitedUser._id, email: exitedUser.email },
      privateKey
    );

    const newKeyStored = await KeyService.storeAndUpdateKeyTokenByUserId({
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
        refreshToken: newKeyStored.refreshToken,
        accessToken: tokens.accessToken,
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
    const existedKeyToken = await KeyService.findKeyTokenByRefreshTokenUsed(
      refreshToken
    );

    // Khi AT hết hạn, hệ thống sẽ cấp mới cặp AT và RT dựa vào việc đi kiểm tra RT trong mảng RT used
    // xem có hay không. Nếu không thì cấp mới, còn nếu có thì tài khoản này có vấn đề.

    // Trường hợp tìm thấy trong mảng RT used: Decode xem tài khoản này là ai trong hệ thống
    if (existedKeyToken) {
      const { userId } = await verifyJWT(
        refreshToken,
        existedKeyToken.publicKey
      );
      // Xóa đi (sẽ yêu cầu ng dùng đăng nhập lại)
      await KeyService.deleteKeyTokenByUserId(userId);
      throw new ForbiddenError("Key token is unsave, pls login agian!");
    }

    // Trường hợp không tìm thấy trong mảng RT used: Tìm kiếm xem có phải là cái RT đang dùng hay không
    // vì chỉ khi cầm RT đang dùng đi xin thì mới có quyền xin cái mới
    const keyTokenHolderRefreshToken =
      await KeyService.findKeyTokenByRefreshToken(refreshToken);
    if (!keyTokenHolderRefreshToken) {
      throw new UnauthorizedError(
        "Do not verify token with this refresh token"
      );
    }

    // Tiếp tục kiểm tra xem liệu token đó có đúng là một thành viên của hệ thống hay không thông qua việc
    // decode cái token đó (nếu nó thực sự là RT đang được hệ thống lưu)
    const { userId, email } = await verifyJWT(
      refreshToken,
      keyTokenHolderRefreshToken.publicKey
    );
    const existedUser = UserService.findOneByEmail({ email });
    if (!existedUser) {
      throw new UnauthorizedError("User not registed");
    }

    // Ok hết thì cấp cho cặp mới và đồng thời đưa RT vào mảng RT used
    const newTokens = await createTokenPair(
      { userId, email },
      keyTokenHolderRefreshToken.privateKey
    );

    // Update: Cập nhật mới cái RT và thêm RT cũ vào mảng RT used
    keyTokenHolderRefreshToken.refreshToken = newTokens.refreshToken;
    keyTokenHolderRefreshToken.refreshTokensUsed.push(refreshToken);
    keyTokenHolderRefreshToken.save();

    return {
      user: existedUser,
      tokens: newTokens,
    };
  };
}

// Export class để bên import tự quyết định cách dùng
module.exports = AuthService;
