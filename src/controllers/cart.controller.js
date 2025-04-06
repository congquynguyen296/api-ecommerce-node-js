"use strict";

const {
  CreatedResponse,
  OkResponse,
} = require("../middlewares/core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  // 1. Thêm sản phẩm vào giỏ hàng
  static addToCart = async (req, res, next) => {
    return new CreatedResponse({
      message: "Add product to cart successfully",
      metadata: await CartService.addProductToCart({
        userId: req.body.userId, // UserId nữa sẽ được lấy từ middleware auth
        product: req.body.product,
      }),
    }).send(res);
  };

  // 2. Giảm số lượng sản phẩm
  static reduceProductQuantity = async (req, res, next) => {
    return new OkResponse({
      message: "Reduce product quantity successfully",
      metadata: await CartService.reduceProductQuantity({
        userId: req.body.userId,
        productId: req.body.productId,
        quantity: req.body.quantity,
      }),
    }).send(res);
  };

  // 3. Tăng số lượng sản phẩm
  static increaseProductQuantity = async (req, res, next) => {
    return new OkResponse({
      message: "Increase product quantity successfully",
      metadata: await CartService.increaseProductQuantity({
        userId: req.body.userId,
        productId: req.body.productId,
        quantity: req.body.quantity,
      }),
    }).send(res);
  };

  // 4. Lấy thông tin giỏ hàng
  static getCart = async (req, res, next) => {
    return new OkResponse({
      message: "Get cart successfully",
      metadata: await CartService.getCart(req.body.userId),
    }).send(res);
  };

  // 5. Xóa sản phẩm khỏi giỏ hàng
  static deleteItemInCart = async (req, res, next) => {
    return new OkResponse({
      message: "Delete item in cart successfully",
      metadata: await CartService.deleteItemInCart({
        userId: req.body.userId,
        productId: req.body.productId,
      }),
    }).send(res);
  };

  // 6. Xóa toàn bộ giỏ hàng
  static deleteCart = async (req, res, next) => {
    return new OkResponse({
      message: "Delete cart successfully",
      metadata: await CartService.deleteCart(req.body.userId),
    }).send(res);
  };
}

module.exports = CartController;
