const express = require("express");
const categories = require("../controllers/categories.controller");
const AuthMiddleware = require("./middleware/Auth.middleware");

const router = express.Router();

router
  .route("/")
  .get(categories.findAll)
  .post(AuthMiddleware.checkRoleManager, categories.create);

router
  .route("/:id")
  .get(categories.findById)
  .put(AuthMiddleware.checkRoleManager, categories.update)
  .delete(categories.delete);

module.exports = router;
