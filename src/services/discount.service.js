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
      is_active: true, // Chỉ lấy các mã đang hoạt động
      start_date: { $lte: new Date() }, // Bắt đầu trước hoặc bằng hôm nay
      end_date: { $gte: new Date() }, // Kết thúc sau hoặc bằng hôm nay
      $expr: { $gt: ["$max_uses", "$used_count"] }, // So sánh max_uses > used_count
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

  // Áp dụng mã giảm giá
  /**
   *
   * @param {discountCode} Code giảm giá
   * @param {userId} Id của user áp dụng
   * @param {shopId} Id shop: Do đây đang là áp dụng voucher của shop
   * @param {products} Array: {productId, shopId, quantity, name, price} --> sẽ có nhiều đối tượng như này
   */
  static async applyDiscountCode({ discountCode, userId, shopId, products }) {
    // 1. Tìm mã giảm giá và kiểm tra tồn tại
    const existedDiscount = await DiscountModel.findOne({
      code: discountCode,
      shop: new Types.ObjectId(shopId),
    });

    if (!existedDiscount) {
      throw new NotFoundError("Discount not found");
    }

    // 2. Lấy thông tin từ discount để kiểm tra
    const {
      is_actice,
      max_uses,
      used_count,
      start_date,
      end_date,
      min_order_value,
      max_use_per_user,
      users_uses,
      applies_to,
      product_ids,
      value,
      type,
    } = existedDiscount;

    // 3. Kiểm tra trạng thái hoạt động
    if (!is_actice) {
      throw new NotFoundError("Discount is not active");
    }

    // 4. Kiểm tra số lượng sử dụng còn lại
    if (max_uses <= used_count) {
      throw new NotFoundError("Discount has reached maximum usage");
    }

    // 5. Kiểm tra thời gian hiệu lực
    const currentDate = new Date();
    if (
      currentDate < new Date(start_date) ||
      currentDate > new Date(end_date)
    ) {
      throw new BadRequestError("Discount has expired or not yet started");
    }

    // 6. Kiểm tra giá trị đơn hàng tối thiểu
    let totalOrder = 0;
    if (min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (totalOrder < min_order_value) {
        throw new BadRequestError(
          `Discount requires minimum order value of ${min_order_value}`
        );
      }
    }

    // 7. Kiểm tra giới hạn sử dụng cho mỗi user
    const userUsageCount = users_uses.filter(
      (user) => user.toString() === userId.toString()
    ).length;
    if (max_use_per_user > 0 && userUsageCount >= max_use_per_user) {
      throw new BadRequestError(
        "User has reached maximum discount usage limit"
      );
    }

    // 8. Đảm bảo mã giảm giá chỉ được áp dụng cho các sản phẩm hợp lệ khi applies_to là "SOME"
    if (applies_to === "SOME") {
      const validProducts = products.every((product) =>
        product_ids.some((id) => id.toString() === product.productId.toString())
      ); // Boolean

      if (!validProducts) {
        throw new BadRequestError(
          "Discount code is not applicable to some products in cart"
        );
      }
    }

    // 9. Tính toán giá trị giảm giá
    let discountAmount = 0;
    if (type === "fixed_mount") {
      discountAmount = value;
    } else if (type === "percentage") {
      discountAmount = (totalOrder * value) / 100;
    }

    // 10. Cập nhật thông tin sử dụng
    await DiscountModel.findOneAndUpdate(
      { code: discountCode, shop: new Types.ObjectId(shopId) },
      {
        $inc: { used_count: 1 }, // Tăng số lần sử dụng
        $push: { users_uses: userId }, // Thêm id người này vào mảng
      }
    );

    // 11. Trả về kết quả
    return {
      totalOrder,
      discountAmount,
      finalTotal: totalOrder - discountAmount,
      appliedDiscount: {
        code: discountCode,
        type,
        value,
      },
    };
  }

  // Xóa mã giảm giá
  static async deleteDiscount({ shopId, discountCode }) {
    // Nên nâng cấp cái chỗ này: Tìm kiếm trước khi code
    // ...
    const deleted = await DiscountModel.findOneAndDelete({
      code: discountCode,
      shop: new Types.ObjectId(shopId),
    });

    return deleted;
  }

  static async cancleDiscount({ shopId, discountCode, userId }) {
    // 1. Tìm mã giảm giá
    const existedDiscount = await DiscountModel.findOne({
      code: discountCode,
      shop: new Types.ObjectId(shopId),
    });

    // 2. Kiểm tra mã giảm giá tồn tại
    if (!existedDiscount) {
      throw new NotFoundError("Discount code does not exist");
    }

    // 3. Lấy thông tin cần thiết
    const { users_uses, used_count } = existedDiscount;

    // 4. Kiểm tra xem user đã sử dụng mã này chưa
    const userIndex = users_uses.findIndex(
      (user) => user.toString() === userId.toString()
    );
    if (userIndex === -1) {
      throw new BadRequestError("User has not used this discount code");
    }

    // 5. Kiểm tra trạng thái để đảm bảo có thể hủy
    if (used_count <= 0) {
      throw new BadRequestError("Discount has not been used yet");
    }

    // 6. Cập nhật database: xóa user khỏi danh sách và giảm used_count
    const updatedDiscount = await DiscountModel.findOneAndUpdate(
      {
        code: discountCode,
        shop: new Types.ObjectId(shopId),
      },
      {
        $pull: { users_uses: userId }, // Xóa userId khỏi mảng users_uses
        $inc: { used_count: -1 }, // Giảm used_count đi 1
      },
      { new: true } // Trả về document sau khi cập nhật
    );

    // 7. Kiểm tra cập nhật thành công
    if (!updatedDiscount) {
      throw new InternalServerError("Failed to cancel discount");
    }

    // 8. Trả về kết quả
    return {
      message: "Discount code canceled successfully",
      discount: {
        code: discountCode,
        remainingUses: updatedDiscount.max_uses - updatedDiscount.used_count,
      },
    };
  }
}

module.exports = DiscountService;
