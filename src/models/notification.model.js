"use strict";

const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "Notifications";

const { Types, Schema, model } = require("mongoose");

// order-001: success, order-002: failed, order-003: new promotion
// shop-001: new product for user follow, ...

const notificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["ORDER-001", "ORDER-002", "PROMOTION-001", "SHOP-001"],
      required: true,
    },
    sender: { type: Types.ObjectId, required: true, ref: "Shop" },
    receiver: { type: Types.ObjectId, required: true },
    content: { type: String, required: true },
    option: { type: Object, default: {} },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = model(DOCUMENT_NAME, notificationSchema);
