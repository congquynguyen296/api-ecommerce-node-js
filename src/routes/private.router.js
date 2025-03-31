"use strict";

const express = require("express");
const asyncHandle = require("../middlewares/core/async.response");
const router = express.Router();

const ProductController = require("../controllers/product.controller");
const AuthController = require("../controllers/auth.controller");
const DiscountController = require("../controllers/discount.controller");
const CartController = require("../controllers/cart.controller");
const CheckoutController = require("../controllers/checkout.controller");

/// Auth
router.use("/shop/auth/log-out", asyncHandle(AuthController.logout));
router.use("/shop/auth/refresh", asyncHandle(AuthController.verify));

/// Product
router.use(
  "/shop/products/add-new-product",
  asyncHandle(ProductController.createProduct)
);
router.use(
  "/shop/products/drafts/all",
  asyncHandle(ProductController.getAllDraftForShop)
);
router.use(
  "/shop/products/publish/:id",
  asyncHandle(ProductController.publishProductByShop)
);
router.use(
  "/shop/products/unpublish/:id",
  asyncHandle(ProductController.unpublishProductByShop)
);
router.use(
  "/shop/products/all",
  asyncHandle(ProductController.findAllProductForShop)
);
router.use(
  "/shop/products/update/:id",
  asyncHandle(ProductController.updateProductById)
);

/// Discount
router.use(
  "/shop/discounts/get-all-with-product/:productId",
  asyncHandle(DiscountController.getAllDiscountCodeWithProduct)
);
router.use(
  "/shop/discounts/create-new-discount",
  asyncHandle(DiscountController.createDiscount)
);

/// Cart
router.post("/shop/cart/add", asyncHandle(CartController.addToCart));
router.patch(
  "/shop/cart/reduce",
  asyncHandle(CartController.reduceProductQuantity)
);
router.patch(
  "/shop/cart/increase",
  asyncHandle(CartController.increaseProductQuantity)
);
router.get("/shop/cart/", asyncHandle(CartController.getCart));
router.delete("/shop/cart/item", asyncHandle(CartController.deleteItemInCart));
router.delete("/shop/cart/", asyncHandle(CartController.deleteCart));

/// Order
router.post(
  "/shop/checkout/review",
  asyncHandle(CheckoutController.checkoutReview)
);

module.exports = router;
