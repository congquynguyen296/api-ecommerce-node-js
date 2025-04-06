const PubsubService = require("../services/pubsub.service");

class ProductTest {
  purcharseProduct(productId, quantity) {
    const order = {
      productId,
      quantity,
    };

    PubsubService.publish("purcharse-event", JSON.stringify(order));
  }
}

module.exports = new ProductTest();
