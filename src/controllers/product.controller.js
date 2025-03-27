"use strict";

const {
  BadRequestError,
  NotFoundError,
} = require("../middlewares/core/error.response");
const {
  CreatedResponse,
  OkResponse,
} = require("../middlewares/core/success.response");
const ProductService = require("../services/product.service");

class ProductController {
  // Create product
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

  // Get data
  getAllDraftForShop = async (req, res, next) => {
    const shopId = req.headers["x-client-id"]; // Lấy từ header
    if (!shopId) {
      throw new BadRequestError("Missing x-client-id in headers");
    }
    return new OkResponse({
      message: "Get all draft is success",
      metadata: await ProductService.findAllDraftForShop({
        shop: shopId,
      }),
    }).send(res);
  };

  // Put data
  publishProductByShop = async (req, res, next) => {
    const productId = req.params.id;
    const shopId = req.headers["x-client-id"];
    if (!shopId || !productId) {
      throw new BadRequestError("Missing x-client-id or product id in headers");
    }
    return new OkResponse({
      message: "Product is publiced",
      metadata: await ProductService.publishProductByShop({
        shop: shopId,
        productId,
      }),
    }).send(res);
  };

  unpublishProductByShop = async (req, res, next) => {
    const productId = req.params.id;
    const shopId = req.headers["x-client-id"];

    if (!productId || !shopId) {
      throw new BadRequestError("Params or client id must be required");
    }
    return new OkResponse({
      message: "Unpublish success",
      metadata: await ProductService.unpublishProductByShop({
        shop: shopId,
        productId: productId,
      }),
    }).send(res);
  };

  // Get data: Search
  searchProduct = async (req, res, next) => {
    const { keySearch, limit, skip } = req.query;
    const results = await ProductService.searchProduct({
      keySearch,
      limit: limit ? parseInt(limit) : undefined,
      skip: skip ? parseInt(skip) : undefined,
    });
    return new OkResponse({
      message: "Search products successfully",
      metadata: results,
    }).send(res);
  };

  // Find all product for shop
  findAllProductForShop = async (req, res, next) => {
    const shopId = req.headers["x-client-id"];
    if (!shopId) {
      throw new NotFoundError("Params is invalid at id shop");
    }
    return new OkResponse({
      message: "All product for shop",
      metadata: await ProductService.findAllProductForShop({
        shop: shopId,
      }),
    }).send(res);
  };

  updateProductById = async (req, res, next) => {
    const productId = req.params.id;
    const updateData = req.body
    if (!productId) {
      throw new BadRequestError("Product id must be required");
    }
    return new OkResponse({
      message: "Update success",
      metadata: await ProductService.updateProductById(productId, updateData),
    }).send(res);
  };
}

module.exports = new ProductController();
