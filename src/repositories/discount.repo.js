"use strict";

const DiscountModel = require("../models/discount.model");

const createDiscount = async ({
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
}) => {
  const newDiscount = await DiscountModel.create({
    name: name,
    description: description,
    type: type,
    value: value,
    code: code,
    start_date: startDate,
    end_date: endDate,
    max_uses: maxUses,
    used_count: usedCount,
    users_uses: usersUses,
    max_use_per_user: maxUsePerUser,
    min_order_value: minOrderValue,
    shop: shop,
    is_actice: isActice,
    applies_to: appliesTo,
    product_ids: productIds,
  });
  return newDiscount;
};

module.exports = {
  createDiscount,
};
