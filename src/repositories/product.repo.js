"use strict";

const { NotFoundError } = require("../middlewares/core/error.response");
const {
  ProductModel,
  ClothingModel,
  JewelryModel,
  ShoesModel,
} = require("../models/product.model");

const { Types } = require("mongoose");
const { filterNonNullData } = require("../utils/joinDataUtils");

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

// Lấy sản phẩm theo Id
const findProductById = async (productId) => {
  const product = await ProductModel.findById(productId)
    .select("-__v, -isDraft, -isPublic, -createAt, -updateAt")
    .lean();

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};

// Lấy ra các thuộc tính
const findAttributesProductById = async (productId, type) => {
  let attributes = null;
  switch (type) {
    case "Clothing":
      attributes = await ClothingModel.findOne({ _id: productId });
      break;
    case "Jewelry":
      attributes = await JewelryModel.findOne({ _id: productId });
      break;
    case "Shoes":
      attributes = await ShoesModel.findOne({ _id: productId });
      break;
  }
  if (!attributes) {
    throw NotFoundError("Attributes is null");
  }
  return attributes;
};

// Cập nhật sản phẩm (các thuộc tính chính)
const updateProdudctById = async (productId, updateData) => {
  const filleredUpdateData = filterNonNullData(updateData);
  console.log(filleredUpdateData);

  const updatedProduct = ProductModel.findByIdAndUpdate(
    productId,
    {
      $set: filleredUpdateData,
    },
    {
      new: true, // Trả về document mới khi cập nhật (mặc định là trả về cái cũ)
      runValidators: true, // Sử dụng validation của mongoose
    }
  )
    .select("-__v, -isDraft, -isPublic, -createAt, -updateAt")
    .lean();
  return updatedProduct;
};

// Update các thuộc tính chi tiết
const updateAttributeProductById = async (productId, type, attributeData) => {
  const filteredAttributes = filterNonNullData(attributeData);
  let updatedAttributes = null;
  switch (type) {
    case "Clothing":
      updatedAttributes = await ClothingModel.findOneAndUpdate(
        { _id: productId },
        { $set: filteredAttributes },
        { new: true, runValidators: true }
      )
        .select("-__v, -createAt, -updateAt")
        .lean();
      break;
    case "Jewelry":
      updatedAttributes = await JewelryModel.findOneAndUpdate(
        { _id: productId },
        { $set: filteredAttributes },
        { new: true, runValidators: true }
      )
        .select("-__v, -createAt, -updateAt")
        .lean();
      break;
    case "Shoes":
      updatedAttributes = await ShoesModel.findOneAndUpdate(
        { _id: productId },
        { $set: filteredAttributes },
        { new: true, runValidators: true }
      )
        .select("-__v, -createAt, -updateAt")
        .lean();
      break;
  }
  return updatedAttributes;
};

/**
 *
 * @param {products} Array: Mảng sản phẩm cần check trong checkout service
 */
const checkProductByServer = async (products) => {
  return await Promise.all(
    products.map(async (product) => {
      const existedProduct = await findProductById(product.productId);
      if (existedProduct) {
        return {
          price: existedProduct.price, // Lấy giá từ DB
          quantity: product.quantity, // Giữ quantity từ request
          productId: existedProduct._id,
        };
      }
    })
  );
};

module.exports = {
  findAllDraftForShop,
  publishProductByShop,
  unpublishProductByShop,
  searchProduct,
  findAllProductForShop,
  findProductById,
  findAttributesProductById,
  updateAttributeProductById,
  updateProdudctById,
  checkProductByServer,
};
