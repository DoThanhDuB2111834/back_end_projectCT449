const express = require("express");
const auth = require("../controllers/auth.controller");
const ApiError = require("../api-error");

const router = express.Router();

router.route("/login").post(auth.login);
router.route("/getRole").get(auth.getRole);
router.route("/logout").post(auth.logout);

module.exports = router;
