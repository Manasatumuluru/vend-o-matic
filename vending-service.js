const { MACHINE_SPECS } = require('./config');

// Encapsulates all vending machine state and business rules.
// Designed to be framework-agnostic so it can be tested independently of HTTP or Express.
class VendingService {
  constructor() {
    // Initialize shelves to max capacity per slot and reset machine credit
    this.shelves = Array(MACHINE_SPECS.SLOT_COUNT).fill(MACHINE_SPECS.MAX_CAPACITY);
    this.credit = 0;
  }

  // Accepts a single quarter and returns the updated credit balance
  insertCoin() {
    this.credit += MACHINE_SPECS.QUARTER_VALUE;
    return this.credit;
  }

  // Attempts to vend from a slot and returns a structured result
  // so the API layer can translate business outcomes into HTTP responses
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

  // Clears and returns the current credit to support refund behavior
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
