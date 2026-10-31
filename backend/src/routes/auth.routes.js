const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/me", authenticate, authController.getMe);
router.post("/logout", authenticate, authController.logout);

router.post(
    "/staff",
    authenticate,
    authorize("admin"),
    authController.createStaff
);

module.exports = router;
