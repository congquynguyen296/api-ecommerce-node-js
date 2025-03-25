"use strict"

const express = require("express");
const asyncHandle = require("../../middlewares/core/async.response");
const router = express.Router();

const productController = require("../../controllers/product.controller");

router.use("/shop/product/add-new-product", asyncHandle(productController.createProduct));

module.exports = router;