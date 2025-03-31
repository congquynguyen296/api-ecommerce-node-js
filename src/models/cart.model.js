"use strict";

const DOCUMENT_NAME = "Cart";
const COLLECTION_NAME = "Carts";

const { Schema, model, Types } = require("mongoose");

const cartSchema = new Schema(
  {
    state: {
      type: String,
      require: true,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    products: { type: Array, require: true, default: [] },
    /**
     * [
     * {
     * productId, shopId, quantity, name, price
     * }
     * ]
     */
    count_product: { type: Number, default: 0 },
    user: { type: String, require: true }, // Để tạm String để test
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, cartSchema);