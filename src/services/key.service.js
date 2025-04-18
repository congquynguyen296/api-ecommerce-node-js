"use strict";

const KeyModel = require("../models/key.model");
const { Types } = require("mongoose");

class KeyService {
  static storeAndUpdateKeyTokenByShopId = async ({
    shopId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    const filter = { shop: shopId }, // Tham chiếu qua tên collecion (ref shop)
      update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken: refreshToken,
      },
      options = {
        upsert: true, // Update khi có sự thay đổi
        new: true, // Trả về cái vừa update chứ không phải cái cũ
      };
    const tokens = await KeyModel.findOneAndUpdate(filter, update, options);
    return tokens ? tokens : null;
  };

  static findKeyTokenByShopId = async (shopId) => {
    const objectId = new Types.ObjectId(shopId); // Chuyển chuỗi thành ObjectId
    const keyToken = await KeyModel.findOne({ shop: objectId }).lean();
    return keyToken;
  };

  static removeKeyTokenById = async (id) => {
    return await KeyModel.deleteOne({ _id: id });
  };

  static findKeyTokenByRefreshTokenUsed = async (refreshToken) => {
    return await KeyModel.findOne({ refreshTokensUsed: refreshToken }).lean();
  };

  static deleteKeyTokenByShopId = async (shopId) => {
    return await KeyModel.deleteOne({ shop: shopId });
  };

  // Lưu ý với lean: Nếu dùng lean thì Mongoose sẽ trả về một POJO, còn không dùng thì sẽ trả về một
  // document (có thể thực hiện update và save trên document)
  static findKeyTokenByRefreshToken = async (refreshToken) => {
    return await KeyModel.findOne({ refreshToken: refreshToken });
  };
}

// Export class để bên import tự quyết định cách dùng
module.exports = KeyService;
