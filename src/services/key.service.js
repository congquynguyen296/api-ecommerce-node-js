"use strict";

const { InternalServerError } = require("../middlewares/core/error.response");
const keyModel = require("../models/key.model");
const { Types } = require("mongoose");

class KeyService {
  static storeAndUpdateKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    const filter = { user: userId }, // Tham chiếu qua tên collecion (ref user)
      update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken,
      },
      options = {
        upsert: true, // Update khi có sự thay đổi
        new: true, // Trả về cái vừa update chứ không phải cái cũ
      };
    const tokens = await keyModel.findOneAndUpdate(filter, update, options);
    return tokens ? tokens.publicKey : null;
  };

  static findKeyTokenByUserId = async (userId) => {
    if (!Types.ObjectId.isValid(userId)) {
      throw new InternalServerError("Invalid userId");
    }
    return await keyModel.findOne({ user: userId }).lean();
  };

  static removeKeyTokenById = async (id) => {
    return await keyModel.deleteOne({ _id: id });
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await keyModel.findOne({ refreshTokensUsed: refreshToken }).lean();
  }
}

// Export class để bên import tự quyết định cách dùng
module.exports = KeyService;
