"use strict";

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

const { Types, model, Schema } = require("mongoose");

const discountSchema = new Schema(
  {
    name: { type: String, require: true },
    description: { type: String, require: true },
    type: { type: String, default: "fixed_mount" }, // fixed_mount: theo số tiền - percentage: theo phần trăm
    value: { type: Number, require: true },
    code: { type: String, require: true },
    start_date: { type: Date, require: true },
    end_date: { type: Date, require: true },
    max_uses: { type: Number, require: true }, // Slg tối đa
    used_count: { type: Number, require: true }, // Đã dùng
    users_uses: { type: Array, default: [] }, // Những user đã dùng (có thể có nhiều ID trùng nhau nếu 1 ng dùng nhiều lần --> Tiện cho việc check sau này)
    max_use_per_user: { type: Number, require: true }, // Giá trị cho phép sử dụng / user
    min_order_value: { type: Number, require: true },
    shop: { type: Types.ObjectId, ref: "Shop" },
    is_active: { type: Boolean, default: true },
    applies_to: { type: String, require: true, enum: ["ALL", "SOME"] }, // Apply cho tất cả hay một vài
    product_ids: { type: Array, default: [] }, // Nếu là SOME thì đây là các sp được áp dụng
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, discountSchema);
