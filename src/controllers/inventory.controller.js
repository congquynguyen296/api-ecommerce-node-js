"use strict";

const {
  OkResponse,
  CreatedResponse,
} = require("../middlewares/core/success.response");
const InventoryService = require("../services/inventory.service");

class InventoryController {
  static addStockToInventory = async (req, res, next) => {
    const stock = req.body.stock;
    const productId = req.body.productId;
    const shopId = req.body.shopId;
    return new CreatedResponse({
      message: "Add product to inventory success",
      metadata: await InventoryService.addStockToInventory(
        stock,
        productId,
        shopId,
        "Ho Chi Minh City"
      ),
    }).send(res);
  };
}

module.exports - InventoryController;
