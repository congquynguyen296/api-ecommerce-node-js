"use strict";

const redis = require("redis");
const redisClient = redis.createClient(); // Tạo một instance tới server
const { promisify } = require("util"); // Đối tượng chuyển callback -> promise
const { reservationInventory } = require("../repositories/inventory.repo");

// Chuyển pExpire trong redis thành hàm trả về promise và gắn vào redisClient
const pExpire = promisify(redisClient.pExpire).bind(redisClient);
const setNXAsync = promisify(redisClient.setNX).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

// Hàm khóa bi quan:
const acquiredLock = async (productId, quantity, cartId) => {
  const key = `lock-v1-${productId}`;
  const retryTime = 10; // Số lần yêu cầu cấp lại khóa
  const expireTime = 3000; // 3s tạm lock

  for (let i = 0; i < retryTime; i++) {
    // Tạo key -> ai nắm được key này sẽ đi vào và bản ghi này sẽ bị khóa lại
    const result = await setNXAsync(key, expireTime); // 1 - chưa ai vào -> trao key và 0 - key đang được nắm -> lock
    if (result === 1) {

      // Check với inventory
      const isReservation = await reservationInventory(productId, quantity, cartId);
      if (isReservation.modifiedCount) {
        await pExpire(key, expireTime); // Đủ điều kiện -> trao khóa và lock trong 3s
        return key;
      }
      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
};

// Hàm giải phóng khóa
const releaseLock = async (keyLock) => {
  return await delAsync(keyLock);
};

module.exports = {
  acquiredLock,
  releaseLock,
};
