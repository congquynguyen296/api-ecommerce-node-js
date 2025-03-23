"use strict";

const express = require("express");
const router = express.Router();

// Gọi đến hàm đã khai báo bên controller và gán cho router
const authController = require("../../controllers/auth.controller");
const asyncHandle = require("../../middlewares/core/async.response");
const { auth } = require("../../middlewares/auth/auth.middleware");

// Sử dụng async handle
router.use("/shop/auth/sign-up", asyncHandle(authController.signUp));
router.use("/shop/auth/sign-in", asyncHandle(authController.signIn));

// Authen khi logout
router.use(auth);
router.use("/shop/auth/log-out", asyncHandle(authController.logout));
router.use("/shop/auth/refresh", asyncHandle(authController.verify));

module.exports = router;
