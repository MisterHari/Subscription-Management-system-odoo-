const express = require("express");
const router = express.Router();

const controller = require("../controllers/invoice.controller");

router.get("/", controller.getInvoices);
router.get("/:id", controller.getInvoice);
router.post("/", controller.createInvoice);
router.put("/:id", controller.updateInvoice);
router.delete("/:id", controller.deleteInvoice);

module.exports = router;
