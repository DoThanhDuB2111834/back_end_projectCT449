const express = require("express");
const books = require("../controllers/books.controller");
const ApiError = require("../api-error");

const router = express.Router();

router.all("*", (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    if (!req.body?.name || req.body?.name === "") {
      return next(new ApiError(400, "Tên không được rỗng"));
    } else if (!req.body?.price || req.body?.price <= 0) {
      return next(new ApiError(400, "Giá sách phải lớn hơn 0"));
    } else if (!req.body?.quantity || req.body?.quantity <= 0) {
      return next(new ApiError(400, "Số lượng sách phải lớn hơn 0"));
    } else if (!req.body?.publisherId || req.body?.publisherId == "") {
      return next(new ApiError(400, "Nhà xuất bản không được rỗng"));
    }
  }
  return next();
});

router.route("/").get(books.findAll).post(books.create);

router.route("/:id").get(books.findById).put(books.update).delete(books.delete);

module.exports = router;
