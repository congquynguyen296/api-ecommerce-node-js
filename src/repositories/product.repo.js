"use strict";

const { NotFoundError } = require("../middlewares/core/error.response");
const {
  ProductModel,
  ClothingModel,
  JewelryModel,
  ShoesModel,
} = require("../models/product.model");

const { Types } = require("mongoose");

// Skip: Số lượng document bỏ qua (cũng dùng để phân trang).
const findAllDraftForShop = async ({ query, limit, skip }) => {
  return await ProductModel.find(query)
    .populate("shop", "name email -_id") // Lấy name, email, loại bỏ _id (dùng dấu -)
    .sort({ updateAt: -1 }) // Sản phẩm mới cập nhật sẽ xuất hiện đầu tiên (-1)
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

// Publish một product
const publishProductByShop = async ({ shop, productId }) => {
  const existedProduct = await ProductModel.findOne({
    // Gạch là vì nó không có tác dụng với số (còn 2 cái này là chuỗi) --> Tạo ra một ObjectId
    shop: new Types.ObjectId(shop), // Mỗi sản phẩm đều tham chiếu tới 1 shop (shop)
    _id: new Types.ObjectId(productId), // Id của sản phẩm
  });

  // Nếu không tìm thấy sản phẩm
  if (!existedProduct) {
    throw new NotFoundError("Not found product");
  }
  // Tìm được
  existedProduct.isDraft = false;
  existedProduct.isPublic = true;

  // Khi update thì mongo trả về một object, một trong số đó là thuộc tính modifiedCount (số lượng update)
  const { modifiedCount } = await existedProduct.updateOne(existedProduct);
  return modifiedCount;
};

// Unpublish một product
const unpublishProductByShop = async ({ shop, productId }) => {
  const existedProduct = ProductModel.find({
    shop: new Types.ObjectId(shop),
    _id: new Types.ObjectId(productId),
  });

  if (!existedProduct) {
    throw new NotFoundError("Product is not existed");
  }

  existedProduct.isDraft = true;
  existedProduct.isPublic = false;

  const { modifiedCount } = ProductModel.updateOne(existedProduct);
  return modifiedCount;
};

// Search product: Tìm kiếm full-text trên name và description
const searchProduct = async ({ keySearch, limit = 50, skip = 0 }) => {
  // Nếu không có từ khóa tìm kiếm, trả về rỗng
  if (!keySearch || typeof keySearch !== "string" || keySearch.trim() === "") {
    return [];
  }

  const results = await ProductModel.find(
    {
      $text: { $search: keySearch }, // Sử dụng text index
      isPublic: true, // Chỉ lấy sản phẩm đã public
    },
    { score: { $meta: "textScore" } } // Thêm trường score để đánh giá mức độ khớp
  )
    .sort({ score: { $meta: "textScore" } }) // Sắp xếp theo độ khớp giảm dần
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

  return results;
};

const findAllProductForShop = async ({ shop, limit = 50, skip = 0 }) => {
  const products = await ProductModel.find({
    shop: new Types.ObjectId(shop),
  })
    // Populate: điền dữ liệu từ một collection khác vào document hiện tại, dựa trên một trường tham
    // chiếu (reference field)
    // Thay vì phải truy vấn riêng collection shop để lấy thông tin (dùng ShopModel.findById()),
    // .populate() tự động làm việc này trong một truy vấn
    .populate("shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "name thumbnail description price quantity type shop rating variation isDraft isPublic slug"
    )
    .lean()
    .exec();

  return products;
};

module.exports = {
  findAllDraftForShop,
  publishProductByShop,
  unpublishProductByShop,
  searchProduct,
  findAllProductForShop,
};
