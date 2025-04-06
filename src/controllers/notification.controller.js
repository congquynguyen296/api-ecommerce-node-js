"use strict";

const {
  CreatedResponse,
  OkResponse,
} = require("../middlewares/core/success.response");
const NotificationService = require("../services/notification.service");

class NotificationController {
  static getNotificationForUser = async (req, res, next) => {
    const userId = "67f29919e5e0afb95e0c83f8";
    return new OkResponse({
      message: "Get notification for user is success",
      metadata: await NotificationService.getListNotificationForUser({
        userId,
      }),
    }).send(res);
  };
}

module.exports = NotificationController;
