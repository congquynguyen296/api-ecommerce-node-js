"use strict";

const express = require("express");
const router = express.Router();

// Gọi đến hàm đã khai báo bên controller và gán cho router
const authController = require("../../controllers/auth.controller");

router.use("/shop/auth/sign-up", authController.signUp);

module.exports = router;
