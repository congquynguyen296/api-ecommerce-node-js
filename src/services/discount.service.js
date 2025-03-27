"use strict";

const { Types } = require("mongoose");
const {
  BadRequestError,
  NotFoundError,
} = require("../middlewares/core/error.response");
const DiscountModel = require("../models/discount.model");
const { createDiscount } = require("../repositories/discount.repo");

/*
    1. Generator discount code: Shop - Admin
    2. Get discount amount: User
    3. Get all discount: User - Shop
    4. Verify discount code: User
    5. Delete discount code: Shop - Admin
    6. Cancle discount code: User
*/

class DiscountService {
  static async createDiscountByShopId(payload) {
    const {
      name,
      description,
      type,
      value,
      code,
      startDate,
      endDate,
      maxUses,
      usedCount,
      usersUses,
      maxUsePerUser,
      minOrderValue,
      shop,
      isActice,
      appliesTo,
      productIds,
    } = payload;

    if (
      new Date() < new Date(startDate) ||
      new Date() > new Date(endDate) ||
      new Date(startDate) > new Date(endDate)
    ) {
      throw new BadRequestError("Date is invalid");
    }

    // Tìm xem có chưa
    const existedDiscount = await DiscountModel.findOne({
      code: code,
      shop: new Types.ObjectId(shop),
    }).lean();
    if (existedDiscount) {
      throw new BadRequestError("Discount is already existed");
    }

    const newDiscount = createDiscount({
      name,
      description,
      type,
      value,
      code,
      startDate,
      endDate,
      maxUses,
      usedCount,
      usersUses,
      maxUsePerUser,
      minOrderValue,
      shop,
      isActice,
      appliesTo,
      productIds: appliesTo == "ALL" ? [] : productIds,
    });
    return newDiscount;
  }

  // Lấy tất cà discount code hợp lệ với product
  static async getAllDiscountCodeWithProduct({
    code,
    shopId,
    productId,
    limit = 50,
    page = 1,
  }) {
    // Tìm mã giảm giá cụ thể nếu có code, hoặc tất cả mã hợp lệ của shop
    const filter = {
      shop: new Types.ObjectId(shopId),
    //   is_active: true, // Chỉ lấy các mã đang hoạt động
    //   start_date: { $lte: new Date() }, // Bắt đầu trước hoặc bằng hôm nay
    //   end_date: { $gte: new Date() }, // Kết thúc sau hoặc bằng hôm nay
    //   $expr: { $gt: ["$max_uses", "$used_count"] }, // So sánh max_uses > used_count
    };

    // Nếu có code, thêm điều kiện tìm chính xác mã đó
    if (code) {
      filter.code = code;
    }

    // Tìm các discount phù hợp
    const discounts = await DiscountModel.find(filter)
      .lean()
      .skip((page - 1) * limit) // Phân trang
      .limit(limit);
    if (!discounts || discounts.length == 0) {
      throw new NotFoundError("No discount match");
    }

    // Lọc ra các discount áp dụng cho các sản phẩm cụ thể
    const validDiscount = discounts.filter((discount) => {
      if (discount.applies_to === "ALL") {
        return true; // Lấy tất cả nếu yêu cầu apply cho tất cả SP
      }
      if (discount.applies_to === "SOME" && productId) {
        return discount.product_ids.includes(productId); // Lấy các code của sảm phẩm được áp dụng trong danh sách
      }
      return false;
    });

    if (!validDiscount || validDiscount.length == 0) {
      throw new NotFoundError("No discounts applicable to this product");
    }
    return {
      discounts: validDiscount,
      total: validDiscount.length,
      page: page,
      limit: limit,
    };
  }
}

module.exports = DiscountService;
