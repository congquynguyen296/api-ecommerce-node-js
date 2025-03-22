"use strict";

const mongoose = require("mongoose");
const { countConnect } = require("../helpers/checkConnect");

// Lấy môi trường được xác định từ file config
const config = require("../configs/config.mongodb");

// Sử dụng biến được quy định trong config
const connectString = `mongodb://${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}?authSource=admin`;
console.log(connectString);

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
