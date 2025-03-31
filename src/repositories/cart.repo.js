"use strict";

const { Types } = require("mongoose");
const CartModel = require("../models/cart.model");

const createCart = async ({ userId, product }) => {
  const query = { user: new Types.ObjectId(userId), state: "ACTIVE" };
  const updateOrInsert = {
    $addToSet: {
      products: product,
    },
  };
  const options = { upsert: true, new: true };
  return CartModel.findOneAndUpdate(query, updateOrInsert, options);
};

const findCartById = async (cartId) => {
  return CartModel.findOne({
    _id: new Types.ObjectId(cartId),
    state: "ACTIVE",
  }).lean();
};

module.exports = {
  createCart,
  findCartById,
};
