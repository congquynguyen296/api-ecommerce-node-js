"use strict";

const connectString = `mongodb://admin:admin@localhost:27017/api-ecommerce?authSource=admin`;
const mongoose = require("mongoose");
const { countConnect } = require("../helpers/check.connect");

class Database {
  constructor() {
    this.connect();
  }

  // Connect
  connect(type = "mongodb") {
    if (true) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }

    mongoose
      .connect(connectString, {
        maxPoolSize: 50,
      })
      .then(() => {
        console.log(
          `Connect successfull with count connect: ${countConnect()} (this check in app)`
        );
      })
      .catch((err) => console.log("Error connect:", err));
  }

  // Tạo instance nếu chưa có
  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }

    return this.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
