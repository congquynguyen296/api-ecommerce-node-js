"use strict";

const express = require("express");
const router = express.Router();

// Gọi đến hàm đã khai báo bên controller và gán cho router
const AuthController = require("../../controllers/auth.controller");
const asyncHandle = require("../../middlewares/core/async.response");
const { auth } = require("../../middlewares/auth/auth.middleware");

// Sử dụng async handle
router.use("/shop/auth/sign-up", asyncHandle(AuthController.signUp));
router.use("/shop/auth/sign-in", asyncHandle(AuthController.signIn));

// Authen khi get resource
router.use(auth);
router.use("/shop/auth/log-out", asyncHandle(AuthController.logout));
router.use("/shop/auth/refresh", asyncHandle(AuthController.verify));

module.exports = router;
