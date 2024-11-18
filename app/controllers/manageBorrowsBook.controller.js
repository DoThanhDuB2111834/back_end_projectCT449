const ApiError = require("../api-error");
const { param } = require("../routes/publisher.route");
const ManageBorrowService = require("../services/manageBorrowsBook.service");
const ReaderService = require("../services/reader.service");
const MongoDB = require("../utils/mongodb.util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const blacklistToken = [];

function isTokenBlacklisted(token) {
  return blacklistToken.includes(token);
}

exports.create = async (req, res, next) => {
  try {
    var token = req.cookies.token;
    if (!token || isTokenBlacklisted(token)) {
      return next(new ApiError(400, "Phiên đăng nhập đã hết hạn"));
    }
    var userId = jwt.verify(token, "mk")._id;
    const Service = new ManageBorrowService(MongoDB.client);
    const document = await Service.create(req.body, userId);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi xảy ra trong quá trình tạo đơn mượn"));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const Service = new ManageBorrowService(MongoDB.client);
    documents = await Service.findAll();
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra khi lấy dữ liệu tất cả người dùng")
    );
  }

  return res.send(documents);
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new Error(400, "Dữ liệu cập nhật không được rỗng"));
  }

  try {
    var token = req.cookies.token;
    if (!token || isTokenBlacklisted(token)) {
      return next(new ApiError(400, "Phiên đăng nhập đã hết hạn"));
    }
    var userId = jwt.verify(token, "mk")._id;
    const Service = new ManageBorrowService(MongoDB.client);
    const document = await Service.update(req.params.id, req.body, userId);
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

exports.delete = async (req, res, next) => {
  try {
    const Service = new ManageBorrowService(MongoDB.client);
    const document = await Service.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại người dùng"));
    }
    return res.send({ messgae: "Xóa người dùng thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa người dùng với id ${req.params.id} `)
    );
  }
};

exports.findById = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const Service = new ManageBorrowService(MongoDB.client);
    const document = await Service.findById(req.params.id);
    console.log(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại người dùng"));
    }
    console.log(document);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy xuất người dùng với id ${req.params.id}`)
    );
  }
};

exports.findKeyword = async (req, res, next) => {
  try {
    const Service = new ReaderService(MongoDB.client);
    const document = await Service.findByKeyword(req.params.keyword);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại người dùng có tên như vậy"));
    }
    console.log(document);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy xuất người dùng với id ${req.params.id}`)
    );
  }
};
