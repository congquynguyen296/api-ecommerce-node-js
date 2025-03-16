const express = require("express");
const morgan = require("morgan");
const { default: helmet } = require("helmet");
const compression = require("compression");
const app = express();

// Sử dụng được các biến môi trường trong ứng dụng
require("dotenv").config();

// Init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// Init db
require("./databases/init.mongodb");

const { checkOverload } = require("./helpers/check.connect");
checkOverload(); // Kiểm soát quá trình kết nối khi khởi tạo db

// Init routes
app.use(require("./routes/index"));

// Init handle error
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ message: "Something is wrong." });
});

module.exports = app;
