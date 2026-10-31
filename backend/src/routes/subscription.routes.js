const express = require("express");
const router = express.Router();

const controller = require("../controllers/subscription.controller");

router.get("/", controller.getSubscriptions);
router.get("/:id", controller.getSubscription);
router.post("/", controller.createSubscription);
router.put("/:id", controller.updateSubscription);
router.delete("/:id", controller.deleteSubscription);

module.exports = router;
