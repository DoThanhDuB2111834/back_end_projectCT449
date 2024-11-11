const ApiError = require("../api-error");
const StaffService = require("../services/staff.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi xảy ra trong quá trình tạo người dùng"));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const staffService = new StaffService(MongoDB.client);
    documents = await staffService.findAll();
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra khi lấy dữ liệu tất cả nhân viên")
    );
  }

  return res.send(documents);
};

exports.findById = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại người dùng"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy xuất người dùng với id ${req.params.id}`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new Error(400, "Dữ liệu cập nhật không được rỗng"));
  }

  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại người dùng"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "Có lỗi xảy ra trong quá trình cập nhật người dùng")
    );
  }
};
