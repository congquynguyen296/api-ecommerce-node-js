"use strict";

const joinProductDetail = async (productId, type) => {
  const modelMap = {
    Clothing: "clothings",
    Jewelry: "jewelries",
    Shoes: "shoes",
  };
};

// Hàm lọc bỏ undefined và null, hỗ trợ nested objects
const filterNonNullData = (data) => {
  const filteredData = {};
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      if (typeof data[key] === "object" && !Array.isArray(data[key])) {
        // Nếu là object (nhưng không phải array), lọc đệ quy
        const nestedFiltered = filterNonNullData(data[key]);
        if (Object.keys(nestedFiltered).length > 0) {
          filteredData[key] = nestedFiltered;
        }
      } else {
        // Nếu không phải object, giữ nguyên giá trị
        filteredData[key] = data[key];
      }
    }
  }
  return filteredData;
};

module.exports = {
  joinProductDetail,
  filterNonNullData,
};
