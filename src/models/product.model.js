"use strict";

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const { model, Types, Schema } = require("mongoose");

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    thumbnail: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    type: {
      type: String,
      required: true,
      enum: ["Clothing", "Jewelry", "Shoes"],
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

// Schema cho Clothing (không cần productId): _id của mỗi schema con sẽ đúng bằng cái _id của product
const clothingSchema = new Schema(
  {
    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
      required: true,
    },
    color: { type: String, required: true },
    material: {
      type: String,
      enum: ["Cotton", "Polyester", "Wool", "Silk", "Denim"],
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Unisex"],
      required: true,
    },
    brand: { type: String, required: true },
  },
  {
    collection: "clothings",
    timestamps: true,
  }
);

// Schema cho Jewelry
const jewelrySchema = new Schema(
  {
    material: {
      type: String,
      enum: ["Gold", "Silver", "Platinum", "Stainless Steel"],
      required: true,
    },
    weight: { type: Number, required: true },
    category: {
      type: String,
      enum: ["Ring", "Necklace", "Bracelet", "Earrings"],
      required: true,
    },
    purity: { type: String, required: true },
  },
  {
    collection: "jewelries",
    timestamps: true,
  }
);

// Schema cho Shoes
const shoesSchema = new Schema(
  {
    size: {
      type: Number,
      min: 35,
      max: 46,
      required: true,
    },
    color: { type: String, required: true },
    material: {
      type: String,
      enum: ["Leather", "Canvas", "Synthetic", "Rubber"],
      required: true,
    },
    style: {
      type: String,
      enum: ["Sneakers", "Boots", "Sandals", "Formal"],
      required: true,
    },
    brand: { type: String, required: true },
  },
  {
    collection: "shoes",
    timestamps: true,
  }
);

// Export các models
const ProductModel = model(DOCUMENT_NAME, productSchema);
const ClothingModel = model("Clothing", clothingSchema);
const JewelryModel = model("Jewelry", jewelrySchema);
const ShoesModel = model("Shoes", shoesSchema);

module.exports = {
  ProductModel,
  ClothingModel,
  JewelryModel,
  ShoesModel,
};
