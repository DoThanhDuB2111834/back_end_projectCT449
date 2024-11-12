const express = require("express");
const staff = require("../controllers/staff.controller");
const ApiError = require("../api-error");

const router = express.Router();

var checkInput = (req, res, next) => {
  if (!req.body?.username) {
    return next(new ApiError(400, "Tên đăng nhập không được rỗng"));
  } else if (!req.body?.name) {
    return next(new ApiError(400, "Tên không được rỗng"));
  } else if (!req.body?.password) {
    return next(new ApiError(400, "mật khẩu không được rỗng"));
  } else if (!req.body?.role) {
    return next(new ApiError(400, "Nhân viên cần được gán có vai trò"));
  } else if (!req.body?.address) {
    return next(new ApiError(400, "Địa chỉ không được rỗng"));
  } else if (!req.body?.phoneNumber) {
    return next(new ApiError(400, "Số điện thoại không được rỗng"));
  } else {
    return next();
  }
};

router.route("/").get(staff.findAll).post(checkInput, staff.create);

router.route("/:id").get(staff.findById).put(checkInput, staff.update);

module.exports = router;
