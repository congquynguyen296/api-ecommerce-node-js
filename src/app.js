const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const app = express();

// Init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression())

// Init db

// Init routes
app.get("/", (req, res, next) => {
    const strCompress = "Demo Compression";

    return res.status(200).json({
        message: "Hello, this is morgan",
        metadata: strCompress.repeat(10000),
    });
});

// Init handle error

module.exports = app;