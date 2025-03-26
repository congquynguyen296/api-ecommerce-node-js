"use strict";

const { validateInput } = require("../utils/validationUtils");
const {
  findAllDraftForShop,
  publishProductByShop,
  searchProduct,
  findAllProductForShop,
  unpublishProductByShop,
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
      "shop",
      "attributes",
      "variation",
    ];
    validateInput(productData, requiredFields);
    return await ProductFactory.createProduct(type, productData);
  }

  // Tìm tất cả các sản phẩm là draft: Phân trang
  static async findAllDraftForShop({ shop, limit = 50, skip = 0 }) {
    const query = { shop, isDraft: true }; // shop sẽ được truyền ObjectId vào
    return await findAllDraftForShop({ query, limit: limit, skip: skip });
  }

  // Bỏ nháp - public một sản phẩm
  static async publishProductByShop({ shop, productId }) {
    return publishProductByShop({ shop, productId });
  }

  // Thêm vào nháp - unpublish một sản phẩm
  static async unpublishProductByShop({ shop, productId }) {
    return unpublishProductByShop({ shop, productId });
  }

  // Tìm kiếm
  static async searchProduct({ keySearch, limit = 50, skip = 0 }) {
    return await searchProduct({ keySearch, limit, skip });
  }

  // Lấy tất cả sản phẩm
  static async findAllProductForShop({ shop, limit = 50, skip = 0 }) {
    return findAllProductForShop({ shop, limit, skip });
  }
}

module.exports = ProductService;
