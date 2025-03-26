"use strict";

const ShopModel = require("../models/shop.model");

class ShopService {

  static findOneByEmail = async ({
    email,
    select = {
      name: true,
      email: true,
      password: true,
      verify: true,
      rolse: true,
    },
  }) => {
    return ShopModel.findOne({ email }).select(select).lean();
  };
}

module.exports = ShopService;
