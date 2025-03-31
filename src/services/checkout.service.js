"use strict";

const {
  NotFoundError,
  BadRequestError,
} = require("../middlewares/core/error.response");
const { findCartById } = require("../repositories/cart.repo");
const { checkProductByServer } = require("../repositories/product.repo");
const { applyDiscountCode } = require("./discount.service");

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

  // 3. Query order using it's ID [User]:

  // 4. Cancle order [User]:

  // 5. Update order status [Admin]:
}

module.exports = CheckoutService;
