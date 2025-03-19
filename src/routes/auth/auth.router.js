"use strict";

const express = require("express");
const router = express.Router();

// Gọi đến hàm đã khai báo bên controller và gán cho router
const authController = require("../../controllers/auth.controller");
const asyncHandle = require("../../middlewares/core/async.response");

// Sử dụng async handle
router.use("/shop/auth/sign-up", asyncHandle(authController.signUp));

module.exports = router;
