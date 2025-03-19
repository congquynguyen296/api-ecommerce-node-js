"use strict";

// Quy định các mã trạng thái HTTP
const STATUS_CODE = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  CONFLICT: 409,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER: 500,
  TOO_MANY_REQUESTS: 429,   // Lỗi quá nhiều request
  UNPROCESSABLE_ENTITY: 422, // Lỗi validation
};

// Định nghĩa class kế thừa Error của NodeJS
class ErrorResponse extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Định nghĩa các class kế thừa ErrorResponse
class BadRequestError extends ErrorResponse {
  constructor(message) {
    super(STATUS_CODE.BAD_REQUEST, message || "Bad Request");
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(message) {
    super(
      STATUS_CODE.FORBIDDEN,
      message || "Forbidden: You do not have permission to access this resource"
    );
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(message) {
    super(STATUS_CODE.CONFLICT, message || "Conflict: Resource already exists");
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message) {
    super(
      STATUS_CODE.NOT_FOUND,
      message || "Not Found: The requested resource was not found"
    );
  }
}

class UnauthorizedError extends ErrorResponse {
  constructor(message) {
    super(
      STATUS_CODE.UNAUTHORIZED,
      message || "Unauthorized: Authentication required"
    );
  }
}

class InternalServerError extends ErrorResponse {
  constructor(message) {
    super(STATUS_CODE.INTERNAL_SERVER, message || "Internal Server Error");
  }
}

class TooManyRequestsError extends ErrorResponse {
  constructor(message) {
    super(
      STATUS_CODE.TOO_MANY_REQUESTS,
      message || "Too Many Requests: Rate limit exceeded"
    );
  }
}

class UnprocessableEntityError extends ErrorResponse {
  constructor(message) {
    super(
      STATUS_CODE.UNPROCESSABLE_ENTITY,
      message || "Unprocessable Entity: Validation failed"
    );
  }
}

// Export các class để sử dụng
module.exports = {
  BadRequestError,
  ForbiddenError,
  ConflictRequestError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
  TooManyRequestsError,
  UnprocessableEntityError,
};
