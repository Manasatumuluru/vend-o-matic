const { MACHINE_SPECS } = require('./config');

class VendingService {
  constructor() {
    this.shelves = Array(MACHINE_SPECS.SLOT_COUNT).fill(MACHINE_SPECS.MAX_CAPACITY);
    this.credit = 0;
  }

  insertCoin() {
    this.credit += MACHINE_SPECS.QUARTER_VALUE;
    return this.credit;
  }

  executeVend(id) {
    const shelfIndex = parseInt(id);

    if (this.shelves[shelfIndex] === undefined || this.shelves[shelfIndex] <= 0) {
      return { success: false, code: 404, currentCredit: this.credit };
    }

    if (this.credit < MACHINE_SPECS.VEND_PRICE) {
      return { success: false, code: 403, currentCredit: this.credit };
    }

    this.shelves[shelfIndex] -= 1;
    const changeAmount = this.credit - MACHINE_SPECS.VEND_PRICE;
    this.credit = 0; 

    return {
      success: true,
      code: 200,
      dispensed: 1,
      stockRemaining: this.shelves[shelfIndex],
      changeDispensed: changeAmount
    };
  }

  clearBalance() {
    const amountToReturn = this.credit;
    this.credit = 0;
    return amountToReturn;
  }

  getInventoryLevels() {
    return this.shelves;
  }

  getSingleShelfStock(index) {
    return this.shelves[index];
  }
}

module.exports = VendingService;