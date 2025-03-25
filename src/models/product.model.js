"use strict";

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const { model, Types, Schema } = require("mongoose");
const slugify = require("slugify");

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

    // More
    slug: { type: String, require: true },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be above 5.0"],
      set: (value) => Math.round(value * 10) / 10, // Làm tròn
    },
    variation: { type: Array, default: [] },
    isDraft: { type: Boolean, default: true, index: true, select: false }, // Đánh index
    isPublic: { type: Boolean, default: false, index: true, select: false },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

// Đánh index cho tìm kiếm
productSchema.index({ name: "text", description: "text" });

// Slug here
productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

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
