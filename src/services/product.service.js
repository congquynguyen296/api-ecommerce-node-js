"use strict";

const { validateInput } = require("../utils/validationUtils");
const { BadRequestError } = require("../middlewares/core/error.response");
const ProductFactory = require("./product.factory");

class ProductService {
  static async createProduct(type, productData) {
    if (!type) {
      throw new BadRequestError("Product type is required");
    }
    // Validation
    const requiredFields = [
      "name",
      "thumbnail",
      "description",
      "price",
      "quantity",
      "user",
      "attributes",
    ];
    validateInput(productData, requiredFields);
    return await ProductFactory.createProduct(type, productData);
  }

  static async getAllProduct(type) {

  }
}

module.exports = ProductService;
