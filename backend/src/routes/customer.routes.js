const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.get("/", customerController.getCustomers);
router.get("/:id", customerController.getCustomer);
router.post("/", customerController.createCustomer);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);
router.delete("/:id", authenticate, authorize("admin"), customerController.deleteCustomer);

module.exports = router;
