"use strict";

const {
  NotFoundError,
  BadRequestError,
} = require("../middlewares/core/error.response");
const { Types } = require("mongoose");
const { findCartById } = require("../repositories/cart.repo");
const { checkProductByServer } = require("../repositories/product.repo");
const { applyDiscountCode } = require("./discount.service");
const { acquiredLock, releaseLock } = require("./redis.service");
const OrderModel = require("../models/order.model");

class CheckoutService {
  // 1. Create new order [User]:
  /**
   *
   * @param {cartId} ObjectId
   * @param {userId} ObjectId
   * @param {shopOrderIds} Array: Vì có thể mỗi sản phẩm mua thuộc về một shop khác nhau
   * Payload: {
   *    cartId,
   *    userId,
   *    shopOderIds: [
   *        shopId,
   *        discounts: [
   *            {
   *                discountId,
   *                code
   *            }, có thể dùng nhiều mã giảm giá
   *        ],
   *        itemProducts: [
   *            {
   *                price,
   *                quantity,
   *                productId
   *            },  có thể có các sản phẩm khác (do có thể mua nhiều SP cho 1 shop)
   *        ]
   *    ]
   * }
   */
  static checkoutReview = async ({ cartId, userId, shopOrderIds }) => {
    const existedCart = await findCartById(cartId);
    if (!existedCart) throw new NotFoundError("Cart not found");

    const checkoutOrder = {
      totalPrice: 0,
      feeShip: 0,
      totalDiscount: 0,
      totalCheckout: 0,
    };
    const shopOrderIdsNew = [];

    for (const { shopId, discounts = [], itemProducts = [] } of shopOrderIds) {
      const checkoutProduct = await checkProductByServer(itemProducts);
      if (!checkoutProduct[0]) throw new BadRequestError("Checkout wrong");

      const checkoutPrice = checkoutProduct.reduce((acc, product) => {
        return acc + product.price * product.quantity;
      }, 0);
      checkoutOrder.totalPrice += checkoutPrice;

      const itemCheckout = {
        shopId,
        discounts,
        priceRaw: checkoutPrice,
        priceApplyDiscount: checkoutPrice,
        itemProducts: checkoutProduct,
      };

      if (discounts.length > 0) {
        const { discountAmount } = await applyDiscountCode({
          discountCode: discounts[0].code,
          userId,
          shopId,
          products: checkoutProduct,
        });
        checkoutOrder.totalDiscount += discountAmount;
        if (discountAmount > 0)
          itemCheckout.priceApplyDiscount -= discountAmount;
      }

      checkoutOrder.totalCheckout += itemCheckout.priceApplyDiscount;
      shopOrderIdsNew.push(itemCheckout);
    }

    return { shopOrderIds, shopOrderIdsNew, checkoutOrder };
  };

  // 2. Query order [User]:
  /**
   * Optimistic: khóa lạc quan giả định rằng xung đột hiếm khi xảy ra. Thay vì khóa tài nguyên ngay
   * lập tức, nó cho phép nhiều tiến trình truy cập và chỉ kiểm tra xung đột khi dữ liệu được cập
   * nhật. Thường sử dụng phiên bản (version) hoặc dấu thời gian (timestamp) để xác định xem dữ liệu
   * có bị thay đổi bởi tiến trình khác hay không. Nếu có xung đột, tiến trình sẽ phải thử lại.
   * @param {*} param0
   */
  static orderByUser = async ({
    shopOrderIds,
    cartId,
    userId,
    userAddress = {},
    userPayment = {},
  }) => {
    // Thực hiện review lại lần nữa: Tránh được tấn công DOS
    const { shopOrderIdsNew, checkoutOrder } = await this.checkoutReview({
      cartId,
      userId,
      shopOrderIds,
    });

    // Dùng flat map để lấy được array product
    const products = shopOrderIdsNew.flatMap((order) => order.itemProducts);
    console.log(`[1]:: ${products}`);

    // Kiểm tra trong kho: Sử dụng Optimistic lock (redis service)
    const acquireProducts = [];
    for (let i = 0; i < products.length; i++) {
      const { productId, quantity } = products[i];
      const keyLock = await acquiredLock(productId, quantity, cartId);
      if (!keyLock) {
        await releaseLock(keyLock);
      }
      acquireProducts.push(keyLock ? true : false);
    }

    // Check: nếu có 1 sp không đủ hàng (acquireProducts exist false) -> thông báo
    if (acquireProducts.includes(false)) {
      throw new BadRequestError("Some products were updated, pls try again");
    }

    // Tạo new order nếu đủ hàng
    const newOrder = await OrderModel.create({
      user: new Types.ObjectId(userId),
      checkout: checkoutOrder,
      shipping: userAddress,
      payment: userPayment,
      products: shopOrderIdsNew,
    });

    // Nếu insert thành công: Xóa product có trong giỏ hàng
    
  };

  // 3. Query order using it's ID [User]:

  // 4. Cancle order [User]:

  // 5. Update order status [Admin]:
}

module.exports = CheckoutService;
