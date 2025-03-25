"use strict";

const express = require("express");
const asyncHandle = require("../../middlewares/core/async.response");
const router = express.Router();

const ProductController = require("../../controllers/product.controller");
const { auth } = require("../../middlewares/auth/auth.middleware");

// Search không cần auth
router.use("/shop/products/search", ProductController.searchProduct);

// Authen khi get resource
router.use(auth);
router.use(
  "/shop/products/add-new-product",
  asyncHandle(ProductController.createProduct)
);
router.use(
  "/shop/products/drafts/all",
  asyncHandle(ProductController.getAllDraftForUser)
);
router.use(
  "/shop/products/publish/:id",
  asyncHandle(ProductController.publicProductByUser)
);

module.exports = router;
