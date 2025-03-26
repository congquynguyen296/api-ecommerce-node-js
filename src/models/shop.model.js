"use strict";

const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "Shops";

// Định nghĩa schema cho collection "Shops"
const shopSchema = new Schema(
  {
    // Tên cửa hàng, giới hạn độ dài tối đa 150 ký tự, loại bỏ khoảng trắng thừa
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    // Email, phải là duy nhất, loại bỏ khoảng trắng thừa
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    // Mật khẩu, bắt buộc phải có
    password: {
      type: String,
      required: true,
    },
    // Trạng thái, chỉ nhận giá trị 'active' hoặc 'inactive', mặc định là 'inactive'
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
    // Xác minh tài khoản, mặc định là false
    verify: {
      type: Boolean,
      default: false,
    },
    // Danh sách vai trò, mặc định là mảng rỗng
    roles: {
      type: Array,
      default: ["0000"],
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    collection: COLLECTION_NAME, // Tên collection trong MongoDB
  }
);

// Export model để sử dụng trong ứng dụng
module.exports = model(DOCUMENT_NAME, shopSchema);
