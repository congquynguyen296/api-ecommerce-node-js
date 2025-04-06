const PubsubService = require("../services/pubsub.service");

class InventoryTest {
  constructor() {
    PubsubService.subscribe("purcharse-event", (chanel, message) => {
      this.updateInventory(message);
    });
  }

  updateInventory(productId, quantity) {
    console.log(
      `Update inventory with ${productId} and quantity = ${quantity}`
    );
  }
}

module.exports = new InventoryTest();
