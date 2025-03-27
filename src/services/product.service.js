"use strict";

const { validateInput } = require("../utils/validationUtils");
const {
  findAllDraftForShop,
  publishProductByShop,
  searchProduct,
  findAllProductForShop,
  unpublishProductByShop,
  findProductById,
  findAttributesProductById,
  updateAttributeProductById,
  updateProdudctById,
} = require("../repositories/product.repo");
const { BadRequestError } = require("../middlewares/core/error.response");
const ProductFactory = require("./product.factory");
const { insertIntoInventory } = require("../repositories/inventory.repo");

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

    const createdProduct = await ProductFactory.createProduct(
      type,
      productData
    );

    // Sau khi thêm sẽ add vào inventory
    const inventoried = await insertIntoInventory(
      createdProduct._id,
      createdProduct.shop,
      createdProduct.quantity
    );

    return {
      newProduct: createdProduct,
      inventory: inventoried,
    };
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

  // Update product: Phải đảm bảo loại được các giá trị undefine hoặc none
  static async updateProductById(productId, updateData) {
    // Lấy sản phẩm và attribute của nó lên
    const product = await findProductById(productId);
    let attributes = null;
    if (product.type) {
      attributes = await findAttributesProductById(productId, product.type);
    }
    // Cập nhật thông tin chính của sản phẩm
    const updatedProduct = await updateProdudctById(productId, updateData);

    // Cập nhật attributes nếu có dữ liệu attributes trong updateData
    let updatedAttributes = attributes; // Giữ nguyên attributes cũ nếu không cập nhật
    if (updateData.attributes && product.type) {
      updatedAttributes = await updateAttributeProductById(
        productId,
        product.type,
        updateData.attributes
      );
    }

    // 4. Trả về kết quả
    return {
      product: updatedProduct,
      attributes: updatedAttributes,
    };
  }
}

module.exports = ProductService;
