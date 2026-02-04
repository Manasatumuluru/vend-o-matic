const express = require('express');
const config = require('./config');
const VendingService = require('./vending-service');

// HTTP layer responsible only for request/response handling.
// All vending machine state and business rules live in VendingService.
const app = express();
const vm = new VendingService();

app.use(express.json());

app.put('/', (req, res) => {
  const { coin } = req.body;

  if (coin === config.MACHINE_SPECS.QUARTER_VALUE) {
    const updatedCredit = vm.insertCoin();
    res.set('X-Coins', updatedCredit).status(204).send();
  } else {
    res.status(400).send({ error: "Invalid coin." });
  }
});

app.delete('/', (req, res) => {
  const refund = vm.clearBalance();
  res.set('X-Coins', refund).status(204).send();
});

app.get('/inventory', (req, res) => {
  res.status(200).json(vm.getInventoryLevels());
});

app.get('/inventory/:id', (req, res) => {
  const quantity = vm.getSingleShelfStock(req.params.id);
  if (quantity !== undefined) {
    res.status(200).json(quantity);
  } else {
    res.status(404).send();
  }
});

app.put('/inventory/:id', (req, res) => {
  const sale = vm.executeVend(req.params.id);

  // Expose current credit or dispensed change via header to mimic hardware-style feedback
  res.set('X-Coins', sale.changeDispensed !== undefined ? sale.changeDispensed : sale.currentCredit);

  if (sale.success) {
    res.set('X-Inventory-Remaining', sale.stockRemaining);
    res.status(200).json({ quantity: sale.dispensed });
  } else {
    res.status(sale.code).send();
  }
});

app.listen(config.PORT, () => {
  // Startup log kept minimal to avoid polluting production logs
  console.log(`Vend-O-Matic active on port ${config.PORT}`);
});
