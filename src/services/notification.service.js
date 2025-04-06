"use strict";

const { Types } = require("mongoose");
const NotificationModel = require("../models/notification.model");

class NotificationService {
  static pushNotificationSystem = async ({
    type = "SHOP-001",
    receivedId,
    senderId,
    options = {},
  }) => {
    let notiContent;

    if (type === "SHOP-001") {
      notiContent = `Shop vừa thêm sản phẩm`;
    } else if (type === "PROMOTION-001") {
      notiContent = `Shop vừa thêm mã giảm giá`;
    }

    const newNoti = await NotificationModel.create({
      type: type,
      sender: new Types.ObjectId(senderId),
      content: notiContent,
      receiver: new Types.ObjectId(receivedId),
      options: options,
    });

    return newNoti;
  };

  static getListNotificationForUser = async ({ userId, type, isRead }) => {
    const match = {
      receiver: new Types.ObjectId(userId),
    };

    // Nếu type được cung cấp, thêm vào điều kiện lọc
    if (type) {
      match.type = type;
    }

    // Nếu isRead được cung cấp, thêm điều kiện lọc theo trạng thái đã đọc
    // Giả sử cần thêm field isRead vào schema nếu muốn dùng tính năng này
    if (typeof isRead === "boolean") {
      match.isRead = isRead;
    }

    try {
      const notifications = await NotificationModel.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "Shops",
            localField: "sender",
            foreignField: "_id",
            as: "sender_info",
          },
        },
        { $unwind: "$sender_info" }, // Vì sender là 1 shop duy nhất
        {
          $project: {
            type: 1,
            content: {
              $concat: [
                "$type", // Thêm type vào đầu
                " - ",
                "$content", // Nội dung gốc
                " (from ",
                "$sender_info.name", // Tên shop
                ")",
              ],
            },
            option: 1,
            createdAt: 1,
            updatedAt: 1,
            "sender_info._id": 1,
            "sender_info.name": 1, // Giả sử Shop có field name, bạn có thể điều chỉnh
          },
        },
        { $sort: { createdAt: -1 } }, // Sắp xếp theo thời gian tạo, mới nhất trước
      ]);

      return {
        success: true,
        data: notifications,
        total: notifications.length,
      };
    } catch (error) {
      throw new Error(`Error getting notifications: ${error.message}`);
    }
  };
}

module.exports = NotificationService;
