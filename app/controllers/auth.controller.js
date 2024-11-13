const ApiError = require("../api-error");
const StaffService = require("../services/staff.service");
const MongoDB = require("../utils/mongodb.util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const blacklistToken = [];

function isTokenBlacklisted(token) {
  return blacklistToken.includes(token);
}

async function comparePassword(plainPassword, hashedPassword) {
  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

exports.login = async (req, res, next) => {
  try {
    var username = req.body.username;
    var password = req.body.password;
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.findOne(username);

    await comparePassword(String(password), document.password).then((match) => {
      if (match) {
        var token = jwt.sign(
          {
            _id: document._id,
          },
          "mk",
          { expiresIn: "1h" }
        );
        return res.send({
          message: "Đăng nhập thành công",
          token: token,
        });
      } else {
        return next(
          new ApiError(400, "Tên đăng nhập hoặc mật khẩu không đúng")
        );
      }
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra trong quá trình truy xuất người dùng")
    );
  }
};

exports.logout = async (req, res, next) => {
  try {
    var token = req.cookies.token;
    if (jwt.verify(token, "mk")) {
      blacklistToken.push(token);
      return res.send({ message: "Đăng xuất thành công" });
    }
  } catch (error) {
    new ApiError(400, "Token không tồn tại");
  }
};

exports.getRole = async (req, res, next) => {
  try {
    var token = req.cookies.token;
    if (!token || isTokenBlacklisted(token)) {
      return next(new ApiError(400, "Phiên đăng nhập đã hết hạn"));
    }
    var userId = jwt.verify(token, "mk")._id;

    if (userId) {
      const staffService = new StaffService(MongoDB.client);
      const document = await staffService.findById(userId);

      if (document) {
        return res.send({
          role: document.role,
        });
      } else {
        return next(new ApiError(400, "ID người dùng không tồn tại"));
      }
    } else {
      return next(new ApiError(400, "ID người dùng không được rỗng"));
    }
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Lỗi xảy ra trong quá trình truy xuất quyền của người dùng"
      )
    );
  }
};
