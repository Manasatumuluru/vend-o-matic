# Vend-O-Matic API Service

Vend-O-Matic is a RESTful vending machine controller designed to simulate a physical vending machine for a Goodyear Tire franchise lobby. The service enforces strict currency handling, maintains inventory across three beverage slots, and exposes machine state via HTTP response headers for easy client or hardware-style integration.

---

## Requirements

* macOS (OSX), Linux, or Windows
* Node.js v16 or later
* npm

---
## Technology Stack

* **Runtime**: Node.js (v16+)  
* **Web Framework**: Express.js  
* **Interface**: RESTful HTTP API (application/json)  
* **Configuration**: Centralized via `config.js`
---

## Setup and Run (macOS / Windows / Linux)

Install dependencies:

```bash
npm install
```

### Start the Service

```bash
npm start
```

The server will initialize and listen for requests at **http://localhost:3000**.

## Design Overview

The application follows a service-oriented structure to separate HTTP routing from vending machine business rules.

* **app.js :** 
  Handles Express server setup, request parsing, and response headers.

* **vending-service.js :** 
  Encapsulates core logic for currency validation, balance tracking, inventory management, vending, and refunds.

* **config.js :** 
  Centralizes configuration for pricing, slot count, capacity, and server port.

This structure keeps the vending rules isolated and easy to modify or test without impacting the API layer.

---


## Operational Constraints

* Accepts only US quarters (value **1**)  
* Each beverage costs **2 quarters ($0.50)**  
* Three slots, **5 items per slot**
* Only one item is dispensed per transaction
* Unused coins are refunded automatically

---

## API Specification

All interactions use the **application/json** content type.

---

## Endpoints

### PUT /
Accepts a quarter and returns the current balance in the **X-Coins** response header.

### DELETE /
Refunds all inserted quarters and resets the machine balance.

### GET /inventory
Returns an array of integers representing remaining stock in each beverage slot.

### PUT /inventory/:id
Attempts to vend a beverage from the specified slot.

* **Success**: Returns `200 OK`, response body `{"quantity": 1}`, and header **X-Inventory-Remaining**
* **Insufficient Funds**: Returns `403 Forbidden`  
* **Out of Stock**: Returns `404 Not Found`


---

## Error Handling

* **403 Forbidden**: Returned when attempting to vend with fewer than **2 quarters** inserted.  
* **404 Not Found**: Returned when the selected beverage slot is empty.  

---

## Testing (macOS / Linux / Windows)
These curl commands can be copy-pasted directly into your terminal to test the API endpoints against the project specifications.

### 1. Insert Coin
Endpoint: PUT /

Request Body: {"coin": 1}

Response: 204 No Content

Header: X-Coins: [# of coins accepted]

```bash
curl -i -X PUT http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"coin": 1}'
```
### 2. Purchase Item (Vend)
Endpoint: PUT /inventory/:id

Response (200): Success. Returns X-Coins (refunded coins) and X-Inventory-Remaining.

Response (403): Insufficient coins inserted.

Response (404): Item out of stock or invalid ID.

```bash
# Example: Purchase from Slot 0
curl -i -X PUT http://localhost:3000/inventory/0
```
### 3. Refund Coins (Cancel)
Endpoint: DELETE /

Response: 204 No Content

Header: X-Coins: [# of coins to be returned]

```bash
curl -i -X DELETE http://localhost:3000/
```
### 4. Check All Inventory
Endpoint: GET /inventory

Response: 200 OK. Returns an array of remaining item quantities.

```bash
curl -i http://localhost:3000/inventory
```
### 5. Check Specific Slot
Endpoint: GET /inventory/:id

Response: 200 OK. Returns the remaining item quantity as an integer.

```bash
# Example: Check Slot 1
curl -i http://localhost:3000/inventory/1
```

