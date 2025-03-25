"use strict";

const joinProductDetail = async (productId, type) => {
    const modelMap = {
        Clothing: "clothings",
        Jewelry: "jewelries",
        Shoes: "shoes"
    }
};

module.exports = {
  joinProductDetail,
};
