const ApiError = require("../../api-error");
const StaffService = require("../../services/staff.service");
const MongoDB = require("../../utils/mongodb.util");

const jwt = require("jsonwebtoken");

exports.checkRoleStaff = async (req, res, next) => {
  try {
    var token = req.cookies.token;
    var user = jwt.verify(token, "mk");

    if (user._id) {
      const staffService = new StaffService(MongoDB.client);
      const document = await staffService.findById(user._id);

      if (document) {
        return next();
      } else {
        return next(new ApiError(400, "ID người dùng không tồn tại"));
      }
    } else {
      return next(new ApiError(400, "ID người dùng không được rỗng"));
    }
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra trong quá trình truy xuất người dùng")
    );
  }
};

exports.checkRoleManager = async (req, res, next) => {
  try {
    var token = req.cookies.token;
    var user = jwt.verify(token, "mk");
    console.log(user);
    if (user._id) {
      const staffService = new StaffService(MongoDB.client);
      const document = await staffService.findById(user._id);

      if (document) {
        if (document.role == "manager") {
          return next();
        } else {
          return res.send({
            message: "Người dùng không có quyền staff",
          });
        }
      } else {
        return next(new ApiError(400, "ID người dùng không tồn tại"));
      }
    } else {
      return next(new ApiError(400, "ID người dùng không được rỗng"));
    }
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra trong quá trình truy xuất người dùng")
    );
  }
};
