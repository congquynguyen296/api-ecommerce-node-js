"use strict";

const AuthService = require("../services/auth.service");

// const AuthService = require("../services/auth.service");

class AuthController {
  signUp = async (req, res, next) => {
    try {
      console.log(`[P]::signUp::`, req.body);

      // Gọi demo
      // const { name, email, password } = req.body;
      // const signUpResult = await AuthService.signUp({ name, email, password });
      // console.log(signUpResult);

      // 200 -> OK :: 201 -> CREATED
      return res.status(201).json(await AuthService.signUp(req.body));
    } catch (err) {
      next(err);
    }
  };
}

module.exports = new AuthController();
