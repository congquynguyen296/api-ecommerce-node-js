"use strict";

const keyModel = require("../models/key.model");

class KeyService {
  static storePublicKey = async ({ userId, publicKey }) => {
    try {
      // publicKey là biến được hash nên có kiểu buffer, cần convert về String để lưu db
      const publicKeyString = publicKey.toString();

      // Tạo mới một document key trong database
      const newKey = await keyModel.create({
        user: userId,
        publicKey: publicKeyString,
      });

      return newKey ? newKey.publicKey : null;  // Lấy lên cái public key đã lưu để có thể tạo tokens
    } catch (error) {
      return error;
    }
  };
}

// Export class để bên import tự quyết định cách dùng
module.exports = KeyService;
