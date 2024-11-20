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

router.route("/clientBorrowRequest").post(manageBorrows.clientBorrowRequest);

router.route("/verify/:code").get(manageBorrows.verify);

router
  .route("/clientBorrowRequestWithAccount")
  .post(manageBorrows.clientBorrowRequestWithAccount);

module.exports = router;
