"use strict";

const { BadRequestError } = require("../middlewares/core/error.response");
const { OkResponse } = require("../middlewares/core/success.response");
const CheckoutService = require("../services/checkout.service");

class CheckoutController {
  // 1. Checkout review
  static checkoutReview = async (req, res, next) => {
    try {
      // 1.1 Lấy dữ liệu từ request body
      const { cartId, userId, shopOrderIds } = req.body;

      // 1.2 Kiểm tra dữ liệu đầu vào
      if (!cartId || !userId || !shopOrderIds || !Array.isArray(shopOrderIds)) {
        throw new BadRequestError("Missing or invalid required fields");
      }

      // 1.3 Gọi service để xử lý
      const checkoutData = await CheckoutService.checkoutReview({
        cartId,
        userId,
        shopOrderIds,
      });

      // 1.4 Trả về response thành công
      return new OkResponse({
        message: "Checkout review completed successfully",
        metadata: checkoutData,
      }).send(res);
    } catch (error) {
      // 1.5 Chuyển lỗi sang middleware xử lý lỗi
      next(error);
    }
  };
}

module.exports = CheckoutController;
