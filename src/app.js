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

const { NotFoundError } = require("./middlewares/core/error.response");
const { checkOverload } = require("./helpers/check.connect");
const router = require("./routes/index");
const { OkResponse } = require("./middlewares/core/success.response");
checkOverload(); // Kiểm soát quá trình kết nối khi khởi tạo db

router.get("/users", (req, res, next) => {
  const users = [
    { userId: 1, name: "Nguyễn Văn A" },
    { userId: 2, name: "Nguyễn Văn B" },
  ];
  new OkResponse({ message: "List user", metadata: users }).send(res);
});

// Init routes
app.use(require("./routes/index"));

// Handle 404 of router
app.use((req, res, next) => {
  const err = new NotFoundError(
    `Not Found - ${req.method} ${req.url} dose not exits!`
  );
  next(err);
});

// Init handle common error
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.status || 500;
  const message = err.message || "Some thing went wrongs.";
  res.status(statusCode).json({
    status: "ERROR",
    code: statusCode,
    message:
      process.env.NODE_ENV === "prod" && statusCode === 500
        ? "Internal Server Error"
        : message,
  });
});

module.exports = app;
