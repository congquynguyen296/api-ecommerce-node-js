"use strict"

const express = require("express");
const router = express.Router();

// Sử dụng các router
router.use("/api/v1", require("./auth/auth.router"));

// Đây là router mặc định
router.get("/", (req, res, next) => {
    return res.status(200).json({
        message: "Hello, this is default url",
    });
});


module.exports = router;