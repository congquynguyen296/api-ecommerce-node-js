"use strict";

const STATUS_CODE = {
  OK: 200,
  CREATED: 201,
};

class SuccessResponse {
  constructor({ message, statusCode = STATUS_CODE.OK, metadata = {} }) {
    this.message = !message ? "Success" : message;
    this.statusCode = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.statusCode).json({
      message: this.message,
      metadata: this.metadata,
      status: "SUCCESS",
    });
  }
}

class OkResponse extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata, statusCode: STATUS_CODE.OK });
  }
}

class CreatedResponse extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata, statusCode: STATUS_CODE.CREATED });
  }
}

module.exports = {
  OkResponse,
  CreatedResponse,
};
