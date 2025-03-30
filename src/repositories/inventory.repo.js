"use strict";

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

module.exports = {
  insertIntoInventory,
};
