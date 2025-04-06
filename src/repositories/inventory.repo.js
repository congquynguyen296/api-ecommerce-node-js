"use strict";

const { Types } = require("mongoose");
const InventoryModel = require("../models/inventory.model");

const insertIntoInventory = async (
  productId,
  shopId,
  stock,
  location = "Unknown"
) => {
  const temp = await InventoryModel.create({
    product: productId,
    location: location,
    stock: stock,
    shop: shopId,
  });
  return temp;
};

// Hàm trừ đi inventory khi đặt hàng
const reservationInventory = async (productId, quantity, cartId) => {
  const query = {
    product: new Types.ObjectId(productId),
    stock: { $gte: quantity }, // quantity hơn hoặc bằng số lượng trong kho (stock)
  };
  const updateSet = {
      $inc: { stock: -quantity },
      $push: {
        reservations: {
          quantity,
          cartId,
          createOn: new Date(),
        }, // Tự động thêm nếu chưa có (là một array)
      },
    },
    option = {
      upsert: true,
      new: true,
    };

  return await InventoryModel.updateOne(query, updateSet);  // Trả về 1 nếu thành công
};

module.exports = {
  insertIntoInventory,
  reservationInventory,
};
