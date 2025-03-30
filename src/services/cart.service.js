/// Một số vấn đề lý thuyết
// 1. Nên tạo mới giỏ hàng ngay khi user login hoặc register
// 2. Khi update số lượng, nên tracking với server luôn

"use strict";

const { Types } = require("mongoose");
const CartModel = require("../models/cart.model");
const { createCart } = require("../repositories/cart.repo");
const { NotFoundError } = require("../middlewares/core/error.response");

class CartService {
  // 1. Add product to cart
  /**
   *
   * @param {userId} ObjectId
   * @param {product} Object
   */
  static addProductToCart = async ({ userId, product }) => {
    // Check cart có tồn tại hay không: Chưa có giỏ hàng thì create
    const existedCart = CartModel.findOne({ user: userId }).lean();
    if (!existedCart) {
      return await createCart({ userId, product });
    }

    // Nếu khác rỗng, tìm kiếm sản phẩm trong db để tăng số lượng nếu có
    const productIndex = existedCart.products.findIndex((p) => {
      p.productId.toString() === product.productId.toString();
    });

    // Tìm thấy trong giỏ hàng
    if (productIndex > -1) {
      const updateQuery = {
        $inc: {
          [`products.${productIndex}.quantity`]: product.quantity || 1,
          count_product: product.quantity || 1,
        },
      };
      return await CartModel.findOneAndUpdate(
        {
          user: new Types.ObjectId(userId),
          state: "ACTIVE",
        },
        updateQuery,
        {
          new: true,
        }
      );
    } else {
      // Không tìm thấy thì thêm
      return await CartModel.findOneAndUpdate(
        { user: new Types.ObjectId(userId), state: "ACTIVE" },
        {
          $push: { products: product },
          $inc: { count_product: 1 },
        },
        { new: true }
      );
    }
  };

  // 2. Reduce product quantity
  static reduceProductQuantity = async ({
    userId,
    productId,
    quantity = 1,
  }) => {
    const existedCart = await CartModel.findOne({
      user: new Types.ObjectId(userId),
      state: "ACTIVE",
    }).lean();
    if (!existedCart) {
      throw new NotFoundError("Cart is not existed");
    }

    const productIndex = existedCart.products.findIndex(
      (p) => p.productId.toString() === productId.toString()
    );
    if (productIndex === -1) {
      throw new NotFoundError("Product invalid in cart");
    }

    const currentQuantity = existedCart.products[productIndex].quantity;
    const newQuantity = currentQuantity - quantity;

    if (newQuantity <= 0) {
      return await CartModel.findOneAndUpdate(
        {
          user: new Types.ObjectId(userId),
          state: "ACTIVE",
        },
        {
          $pull: { products: { productId: productId } },
          count_product: -quantity,
        },
        {
          new: true,
        }
      );
    }
    return await CartModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId), state: "ACTIVE" },
      {
        $inc: {
          [`products.${productIndex}.quantity`]: -quantity,
          count_product: -quantity,
        },
      },
      { new: true }
    );
  };

  // 3. Increase product quantity
  static increaseProductQuantity = async ({
    userId,
    productId,
    quantity = 1,
  }) => {
    const cart = await CartModel.findOne({
      user: new Types.ObjectId(userId),
      state: "ACTIVE",
    }).lean();

    if (!cart) throw new NotFoundError("Cart not found");

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId.toString()
    );

    if (productIndex === -1)
      throw new NotFoundError("Product not found in cart");

    return await CartModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId), state: "ACTIVE" },
      {
        $inc: {
          [`products.${productIndex}.quantity`]: quantity,
          count_product: quantity,
        },
      },
      { new: true }
    );
  };

  // 4. Get cart (User)
  static getCart = async (userId) => {
    const cart = await CartModel.findOne({
      user: new Types.ObjectId(userId),
      state: "ACTIVE",
    }).lean();

    if (!cart) {
      throw new NotFoundError("Cart not existed");
    }
    return cart;
  };

  // 5. Delete item in cart (User)
  static deleteItemInCart = async ({ userId, productId }) => {
    const cart = await CartModel.findOne({
      user: new Types.ObjectId(userId),
      state: "ACTIVE",
    }).lean();

    if (!cart) {
      throw new NotFoundError("Can not delete item in cart");
    }

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId.toString()
    );

    if (productIndex === -1) {
      throw new NotFoundError("Product not found in cart");
    }

    return await CartModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId), state: "ACTIVE" },
      {
        $pull: { products: { productId: productId } },
        $inc: { count_product: -1 },
      },
      { new: true }
    );
  };

  // 6. Delete cart (User)
  static deleteCart = async (userId) => {
    const result = await CartModel.findOneAndDelete({
      user: new Types.ObjectId(userId),
      state: "ACTIVE",
    });

    if (!result) throw new NotFoundError("Cart not found");
    return { deleted: true };
  };
}

module.exports = CartService;
