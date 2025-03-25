"use strict";

const UserModel = require("../models/user.model");

class UserService {

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
    return UserModel.findOne({ email }).select(select).lean();
  };
}

module.exports = UserService;
