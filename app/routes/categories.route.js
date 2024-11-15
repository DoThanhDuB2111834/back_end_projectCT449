const express = require("express");
const categories = require("../controllers/categories.controller");

const router = express.Router();

router.route("/").get(categories.findAll).post(categories.create);

router
  .route("/:id")
  .get(categories.findById)
  .put(categories.update)
  .delete(categories.delete);

module.exports = router;
