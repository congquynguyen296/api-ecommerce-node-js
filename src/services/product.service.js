"use strict";

const { validateInput } = require("../utils/validationUtils");
const {
  findAllDraftForUser,
  publicProductByUser,
  searchProduct,
} = require("../repositories/product.repo");
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
      "variation",
    ];
    validateInput(productData, requiredFields);
    return await ProductFactory.createProduct(type, productData);
  }

  // Tìm tất cả các sản phẩm là draft: Phân trang
  static async findAllDraftForUser({ user, limit = 50, skip = 0 }) {
    const query = { user, isDraft: true }; // user sẽ được truyền ObjectId vào
    return await findAllDraftForUser({ query, limit: limit, skip: skip });
  }

  // Bỏ nháp - public một sản phẩm
  static async publicProductByUser({ user, productId }) {

    // Login nghiệp vụ sẽ ở đây
    return publicProductByUser({ user, productId });
  }

  // Tìm kiếm
  static async searchProduct({ keySearch, limit = 50, skip = 0 }) {
    return await searchProduct({ keySearch, limit, skip });
  }
}

module.exports = ProductService;
