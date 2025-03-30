"use strict";

const { CreatedResponse, OkResponse } = require("../middlewares/core/success.response");
const DiscountService = require("../services/discount.service");

class DiscountController {
  // Create controller
  createDiscount = async (req, res, next) => {
    try {
      const payload = {
        ...req.body,
        shop: req.headers["x-client-id"],
      };
      return new CreatedResponse({
        message: "Create discount success",
        metadata: await DiscountService.createDiscountByShopId(payload),
      }).send(res);
    } catch (error) {
      next(error); // Chuyển lỗi cho middleware xử lý
    }
  };

  // Get data
  getAllDiscountCodeWithProduct = async (req, res, next) => {
    try {
      const shopId = req.headers["x-client-id"];
      const productId = req.params.productId;
      const { code, limit, page } = req.query;

      const discounts = await DiscountService.getAllDiscountCodeWithProduct({
        code: code || undefined, 
        shopId: shopId,
        productId: productId || undefined,
        limit: parseInt(limit) || 50, 
        page: parseInt(page) || 1,
      });

      return new OkResponse({
        message: "Discount codes retrieved successfully",
        metadata: discounts,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Apply discount
  applyDiscount = async (req, res, next) => {
    try {


    } catch (error) {
      next(error);
    }
  }

  // Delete discount
  deleteDiscount = async (req, res, next) => {
    try {
      

    } catch (error) {
      next(error);
    }
  }

  // Cancle discount
  cancleDiscount = async (req, res, next) => {
    try {
      

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DiscountController();
