const express = require("express");
const manageBorrows = require("../controllers/manageBorrowsBook.controller");
const { route } = require("./publisher.route");

const router = express.Router();

router.route("/").get(manageBorrows.findAll).post(manageBorrows.create);

router
  .route("/:id")
  .get(manageBorrows.findById)
  .put(manageBorrows.update)
  .delete(manageBorrows.delete);

router.route("/findKeyword/:keyword").get(manageBorrows.findKeyword);

module.exports = router;
