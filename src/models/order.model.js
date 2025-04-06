"use strict";

const { Schema, model } = require("mongoose");

const COLLECTION_NAME = "Orders";
const DOCUMENT_NAME = "Order";

const orderSchema = new Schema(
  {
    user: { type: String, required: true }, // Để tạm String để test
    checkout: { type: Object, default: {} }, // Object chứa đối tượng khi checkout qua với các thông tin
    /**
     * totalPrice,
     * totalApplyDiscount,
     * feeShip
     */
    shipping: { type: Object, default: {} },
    /**
     * street,
     * city,
     * state,
     * country
     */
    payment: { type: String, required: true },
    products: { type: Array, default: [] },
    tracking: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRM", "SHIPPED", "CANCEL", "DELIVERED"],
      default: "PENDING",
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, orderSchema);
