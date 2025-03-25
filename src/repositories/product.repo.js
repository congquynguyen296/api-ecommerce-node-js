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
/**
 *
 * @query Câu truy vấn, thường là ObjectId + isDraft
 * @returns
 */
const findAllDraftForUser = async ({ query, limit, skip }) => {
  return await ProductModel.find(query)
    .populate("user", "name email -_id") // Lấy name, email, loại bỏ _id (dùng dấu -)
    .sort({ updateAt: -1 }) // Sản phẩm mới cập nhật sẽ xuất hiện đầu tiên (-1)
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

// Publish một product
const publicProductByUser = async ({ user, productId }) => {
  const existedProduct = await ProductModel.findOne({
    // Gạch là vì nó không có tác dụng với số (còn 2 cái này là chuỗi) --> Tạo ra một ObjectId
    user: new Types.ObjectId(user), // Mỗi sản phẩm đều tham chiếu tới 1 shop (user)
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

module.exports = { findAllDraftForUser, publicProductByUser, searchProduct };
