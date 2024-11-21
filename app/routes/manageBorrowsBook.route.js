const express = require("express");
const manageBorrows = require("../controllers/manageBorrowsBook.controller");
const AuthMiddleware = require("./middleware/Auth.middleware");
const { route } = require("./publisher.route");

const router = express.Router();

router
  .route("/")
  .get(AuthMiddleware.checkRoleStaff, manageBorrows.findAll)
  .post(manageBorrows.create);

router
  .route("/:id")
  .get(manageBorrows.findById)
  .put(AuthMiddleware.checkRoleStaff, manageBorrows.update)
  .delete(manageBorrows.delete);

router.route("/findKeyword/:keyword").get(manageBorrows.findKeyword);

router.route("/clientBorrowRequest").post(manageBorrows.clientBorrowRequest);

router.route("/verify/:code").get(manageBorrows.verify);

router
  .route("/clientBorrowRequestWithAccount")
  .post(manageBorrows.clientBorrowRequestWithAccount);

module.exports = router;
