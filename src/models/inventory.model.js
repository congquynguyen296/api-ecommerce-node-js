"use strict";

const DOCUMENT_NAME = "Inventory";
const COLLECTION_NAME = "Inventories";

const { model, Types, Schema } = require("mongoose");
const enventorySchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product" },
    location: { type: String, default: "Unknown" },
    stock: { type: Number, require: true },
    shop: { type: Types.ObjectId, ref: "Shop" },
    reservations: { type: Array, default: [] }, // Khi user add vào giỏ thì lưu vào đây, khi thanh toán thì xóa nó khỏi mảng này
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = model(DOCUMENT_NAME, enventorySchema);
