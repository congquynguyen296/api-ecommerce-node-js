"use strict";

const { BadRequestError } = require("../middlewares/core/error.response");
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
  getAllDraftForUser = async (req, res, next) => {
    const userId = req.headers["x-client-id"]; // Lấy từ header
    if (!userId) {
      throw new BadRequestError("Missing x-client-id in headers");
    }
    return new OkResponse({
      message: "Get all draft is success",
      metadata: await ProductService.findAllDraftForUser({
        user: userId,
      }),
    }).send(res);
  };

  // Put data
  publicProductByUser = async (req, res, next) => {
    const productId = req.params.id;
    const userId = req.headers["x-client-id"];
    if (!userId || !productId) {
      throw new BadRequestError("Missing x-client-id or product id in headers");
    }
    return new OkResponse({
      message: "Product is publiced",
      metadata: await ProductService.publicProductByUser({
        user: userId,
        productId,
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
}

module.exports = new ProductController();
