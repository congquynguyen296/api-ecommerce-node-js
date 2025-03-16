"use strict";

const pick = require("lodash/pick"); // Chỉ cần dùng pick

const getIntoData = ({ object = {}, fields = [] }) => {
  return pick(object, fields);
};

module.exports = {
  getIntoData,
};
