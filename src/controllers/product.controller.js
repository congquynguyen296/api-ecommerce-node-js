"use strict";

const { BadRequestError } = require("../middlewares/core/error.response");
const { CreatedResponse } = require("../middlewares/core/success.response");
const ProductService = require("../services/product.service");

class ProductController {
  createProduct = async (req, res, next) => {
    try {
      const { type, ...productData } = req.body;

      if (!type) {
        throw new BadRequestError("Product type is required");
      }
      return new CreatedResponse({
        message: "Created product is success",
        metadata: await ProductService.createProduct(type, productData),
      }).send(res);
    } catch (error) {
      next(error); // Chuyển lỗi cho middleware xử lý
    }
  };
}

module.exports = new ProductController();
