"use strict";

const {
  ProductModel,
  ClothingModel,
  JewelryModel,
  ShoesModel,
} = require("../models/product.model");


class ProductFactory {
  static async createProduct(type, payload) {
    switch (type) {
      case "Clothing":
        return new Clothing(payload).createProduct();
      case "Jewelry":
        return new Jewelry(payload).createProduct();
      case "Shoes":
        return new Shoes(payload).createProduct();
      default:
        throw new Error(`Invalid product type: ${type}`);
    }
  }
}

class Product {
  constructor({
    name,
    thumbnail,
    description,
    price,
    quantity,
    type,
    user,
    rating,
    variation,
    isDraft,
    isPublic,
  }) {
    this.name = name;
    this.thumbnail = thumbnail;
    this.description = description;
    this.price = price;
    this.quantity = quantity;
    this.type = type;
    this.user = user;
    this.rating = rating;
    this.isDraft = isDraft;
    this.isPublic = isPublic;
    this.variation = variation;
  }

  async saveCommonAttributes() {
    return await ProductModel.create(this);
  }
}

class Clothing extends Product {
  constructor(payload) {
    super(payload);
    this.type = "Clothing";
    this.attributes = payload.attributes;
  }

  async createProduct() {
    // Lưu thuộc tính chung vào products trước
    const product = await this.saveCommonAttributes();

    // Dùng _id của product làm _id cho clothing
    const clothingData = {
      _id: product._id, // Gán _id bằng _id của product
      ...this.attributes,
    };
    await ClothingModel.create(clothingData);

    return product; // Trả về document từ products
  }
}

class Jewelry extends Product {
  constructor(payload) {
    super(payload);
    this.type = "Jewelry";
    this.attributes = payload.attributes;
  }

  async createProduct() {
    const product = await this.saveCommonAttributes();
    const jewelryData = {
      _id: product._id,
      ...this.attributes,
    };
    await JewelryModel.create(jewelryData);
    return product;
  }
}

class Shoes extends Product {
  constructor(payload) {
    super(payload);
    this.type = "Shoes";
    this.attributes = payload.attributes;
  }

  async createProduct() {
    const product = await this.saveCommonAttributes();
    const shoesData = {
      _id: product._id,
      ...this.attributes,
    };
    await ShoesModel.create(shoesData);
    return product;
  }
}

module.exports = ProductFactory;
