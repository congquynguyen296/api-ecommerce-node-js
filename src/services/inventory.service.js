"use strict";

const { NotFoundError } = require("../middlewares/core/error.response");
const InventoryModel = require("../models/inventory.model");
const { findProductById } = require("../repositories/product.repo");

class InventoryService {
  static async addStockToInventory(
    stock,
    productId,
    shopId,
    location = "Ho Chi Minh City"
  ) {
    const existedProduct = await findProductById(productId);
    if (!existedProduct) {
      throw new NotFoundError("Product does not existed");
    }

    const query = { shop: shopId, product: productId };
    const updateSet = {
      $inc: {
        stock: stock,
      },
      $set: {
        location: location,
      },
    };
    const option = {
      upsert: true,
      new: true,
    };
    return await InventoryModel.findOneAndUpdate(query, updateSet, option);
  }
}

module.exports = InventoryService;
