"use strict";

const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const ProductController = require("../controllers/product.controller");
const asyncHandle = require("../middlewares/core/async.response");

// Sử dụng async handle
router.use("/shop/auth/sign-up", asyncHandle(AuthController.signUp));
router.use("/shop/auth/sign-in", asyncHandle(AuthController.signIn));

router.use("/shop/products/search", ProductController.searchProduct);


module.exports = router;
