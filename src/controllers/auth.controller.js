"use strict";

const {
  OkResponse,
  CreatedResponse,
} = require("../middlewares/core/success.response");
const AuthService = require("../services/auth.service");

class AuthController {
  signUp = async (req, res, next) => {
    new CreatedResponse({
      message: "Sign up successful",
      metadata: await AuthService.signUp(req.body),
    }).send(res);
  };

  signIn = async (req, res, next) => {
    new OkResponse({
      message: "Login successful",
      metadata: await AuthService.signIn(req.body),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new OkResponse({
      message: "Logout successful",
      metadata: await AuthService.logout(req.keyStored),
    }).send(res);
  };

  verify = async (req, res, next) => {
    new OkResponse({
      message: "Get tokens success",
      metadata: await AuthService.handleRefreshToken(req.body.refreshToken),
    }).send(res);
  };
}

module.exports = new AuthController();
