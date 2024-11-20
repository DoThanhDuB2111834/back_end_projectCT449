const ApiError = require("../api-error");
const { param } = require("../routes/publisher.route");
const ManageBorrowService = require("../services/manageBorrowsBook.service");
const ReaderService = require("../services/reader.service");
const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const blacklistToken = [];

function isTokenBlacklisted(token) {
  return blacklistToken.includes(token);
}

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: "dub2111834@student.ctu.edu.vn", pass: "glbtmybughcrfvhj" },
}); // Tạo mã xác nhận ngẫu nhiên

function generateVerificationCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase(); // Mã xác nhận 6 ký tự
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
    const bookService = new BookService(MongoDB.client);
    console.log(document);
    const bookDocument = await bookService.findById(req.body.bookId);
    console.log(bookDocument);
    await bookService.update(bookDocument._id, {
      quantity: bookDocument.quantity - 1,
    });
    return res.send(document);
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Lỗi xảy ra trong quá trình tạo đơn mượn"));
  }
};

exports.clientBorrowRequest = async (req, res, next) => {
  try {
    const {
      email,
      surname,
      name,
      gender,
      birthdate,
      address,
      phoneNumber,
      dateBorrow,
      dateReturn,
      bookId,
    } = req.body;
    console.log(req.body);

    const readerService = new ReaderService(MongoDB.client);
    var readerDocument = await readerService.findByEmail(email);
    if (readerDocument) {
      return next(new ApiError(400, "Lỗi đọc giả đã được tạo"));
    }
    const verificationCode = generateVerificationCode();
    req.session.verificationCode = verificationCode;
    req.session.email = email;
    req.session.name = name;
    req.session.surname = surname;
    req.session.gender = gender;
    req.session.birthdate = birthdate;
    req.session.address = address;
    req.session.dateBorrow = dateBorrow;
    req.session.dateReturn = dateReturn;
    req.session.bookId = bookId;
    req.session.phoneNumber = phoneNumber;
    let mailOptions = {
      from: "dub2111834@student.ctu.edu.vn",
      to: email,
      subject: "Mã xác nhận tài khoản",
      text: `Mã xác nhận của bạn là: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return next(new ApiError(error));
      }
      return res.send({ message: "Đã gửi mail xác nhận" });
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.verify = async (req, res, next) => {
  try {
    const userVerifiedCode = req.params.code;
    const readerService = new ReaderService(MongoDB.client);

    if (userVerifiedCode == req.session.verificationCode) {
      const reader = {
        email: req.session.email,
        name: req.session.name,
        surname: req.session.surname,
        gender: req.session.gender,
        birthdate: req.session.birthdate,
        address: req.session.address,
        phoneNumber: req.session.phoneNumber,
      };
      var readerDocument = await readerService.create(reader);
      console.log(readerDocument);
      const manage_borrows_book = {
        readerId: readerDocument._id,
        bookId: req.session.bookId,
        dateBorrow: req.session.dateBorrow,
        dateReturn: req.session.dateReturn,
        state: "Chờ xác nhận",
      };

      const manageBorrowService = new ManageBorrowService(MongoDB.client);
      const manage_borrows_book_document = await manageBorrowService.create(
        manage_borrows_book
      );

      const bookService = new BookService(MongoDB.client);
      const bookDocument = await bookService.findById(
        manage_borrows_book_document.bookId
      );
      await bookService.update(bookDocument._id, {
        quantity: bookDocument.quantity - 1,
      });

      let mailOptions = {
        from: "dub2111834@student.ctu.edu.vn",
        to: req.session.email,
        subject: "Xác nhận gửi yêu cầu thành công",
        text: `Đơn mượn sách của bạn đã được tạo và đang chờ admin xử lý, bạn vui lòng kiểm tra email thường xuyên để cập nhật thông tin nhé!`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return next(new ApiError(error));
        }
        return res.send({
          message: "Đã xác nhận",
          manageBorrow: manage_borrows_book_document,
        });
      });

      // return res.send({ manageBorrow: manage_borrows_book_document });
    }
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra khi lấy dữ liệu tất cả người dùng")
    );
  }
};

exports.clientBorrowRequestWithAccount = async (req, res, next) => {
  try {
    const readerService = new ReaderService(MongoDB.client);
    var readerDocument = await readerService.findByEmail(req.body.email);
    if (!readerDocument) {
      return next(
        new ApiError(500, "Lỗi xảy ra khi lấy dữ liệu tất cả người dùng")
      );
    }
    const Service = new ManageBorrowService(MongoDB.client);
    console.log(readerDocument);
    const borrow = {
      readerId: readerDocument._id,
      bookId: req.body.bookId,
      dateBorrow: req.body.dateBorrow,
      dateReturn: req.body.dateReturn,
      state: "Chờ xác nhận",
    };
    const document = await Service.create(borrow);

    const bookService = new BookService(MongoDB.client);
    const bookDocument = await bookService.findById(document.bookId);
    await bookService.update(bookDocument._id, {
      quantity: bookDocument.quantity - 1,
    });
    let mailOptions = {
      from: "dub2111834@student.ctu.edu.vn",
      to: readerDocument.email,
      subject: "Xác nhận gửi yêu cầu thành công",
      text: `Đơn mượn sách của bạn đã được tạo và đang chờ admin xử lý, bạn vui lòng kiểm tra email thường xuyên để cập nhật thông tin nhé!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return next(new ApiError(error));
      }
      return res.send({
        message: "Đã xác nhận",
        manageBorrow: document,
      });
    });
    // return res.send(document);
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, "Lỗi xảy ra khi lấy dữ liệu tất cả người dùng")
    );
  }
};

exports.checkLateDeadline = async (req, res, next) => {
  try {
    let documents = [];
    const Service = new ManageBorrowService(MongoDB.client);
    documents = await Service.findAll();
    const currentDateTime = new Date();
    documents.forEach(async (borrowBook, index) => {
      var dateReturn = new Date(borrowBook.dateReturn);
      if (
        dateReturn.getTime() < currentDateTime.getTime() &&
        borrowBook.state == "Đang mượn"
      ) {
        await Service.update(borrowBook._id, { state: "Trễ hạn" });
      }
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra khi lấy dữ liệu tất cả người dùng")
    );
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
    var staffId = jwt.verify(token, "mk")._id;
    const Service = new ManageBorrowService(MongoDB.client);
    const document = await Service.update(req.params.id, req.body, staffId);

    const readerService = new ReaderService(MongoDB.client);
    const bookService = new BookService(MongoDB.client);
    const readerDocument = await readerService.findById(document.readerId);
    const bookDocument = await bookService.findById(document.bookId);

    if (document.state == "Đang mượn") {
      await bookService.update(bookDocument._id, {
        quantity: bookDocument.quantity - 1,
      });
      let mailOptions = {
        from: "dub2111834@student.ctu.edu.vn",
        to: readerDocument.email,
        subject: "Mượn sách thành công",
        text: `Admin đã xác nhận yêu cầu mượn sách ${bookDocument.name} của bạn ${readerDocument.surname} ${readerDocument.name}. 
          Mã đơn mượn sách là ${document._id}, bạn vui lòng dến thư viện đưa mã cho nhân viên để nhận sách`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return next(new ApiError(error));
        }
        return res.send({
          message: "Đã xác nhận",
          manageBorrow: document,
        });
      });
    } else if (document.state == "Đã hủy") {
      let mailOptions = {
        from: "dub2111834@student.ctu.edu.vn",
        to: readerDocument.email,
        subject: "Mượn sách không thành công",
        text: `Admin đã hủy yêu cầu mượn sách ${bookDocument.name} của bạn ${readerDocument.surname} ${readerDocument.name}. 
          Do sách không đủ điều kiện để cho mượn.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return next(new ApiError(error));
        }
        return res.send({
          message: "Đã hủy",
          manageBorrow: document,
        });
      });
    } else if (document.state == "Đã trả") {
      await bookService.update(bookDocument._id, {
        quantity: bookDocument.quantity + 1,
      });

      return res.send({
        message: "Cập nhật trạng thái đơn trả sách thành công",
      });
    }

    console.log(document, bookDocument, readerDocument);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại đơn mượn sách"));
    }
    // return res.send(document);
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
    console.log(document);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại người dùng"));
    }
    const bookService = new BookService(MongoDB.client);
    const bookDocument = await bookService.findById(document.bookId);
    await bookService.update(bookDocument._id, {
      quantity: bookDocument.quantity + 1,
    });
    return res.send({ messgae: "Xóa đơn mượn sách thành công" });
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
