"use strict";

const { BadRequestError } = require("../middlewares/core/error.response");

const validateInput = (data, requiredField = []) => {
  for (let filed of requiredField) {
    if (!data[filed]) {
      throw new BadRequestError(`Filed ${filed} is required`);
    }
  }
};

module.exports = {
  validateInput,
};
