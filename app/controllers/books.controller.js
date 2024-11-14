const ApiError = require("../api-error");
const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file at ${filePath}:`, err);
    } else {
      console.log(`Successfully deleted file at ${filePath}`);
    }
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu trữ file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Lưu file với thời gian hiện tại để tránh trùng tên
  },
});

const upload = multer({ storage: storage });

exports.create = async (req, res, next) => {
  var imagePath = `/uploads/${req.file.filename}`; // Lưu bookData vào cơ sở dữ liệu tại đây (ví dụ: MongoDB)
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.create(req.body, imagePath);
    return res.send(document);
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Lỗi xảy ra trong quá trình tạo sách"));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const bookService = new BookService(MongoDB.client);
    documents = await bookService.findAll();
  } catch (error) {
    return next(new ApiError(500, "Lỗi xảy ra khi lấy dữ liệu tất cả sách"));
  }

  return res.send(documents);
};

exports.findById = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.findById(req.params.id);
    console.log(document);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại sách"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy xuất sách với id ${req.params.id}`)
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new Error(400, "Dữ liệu cập nhật không được rỗng"));
  }

  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại sách"));
    }
    if (req.file) {
      let name = document.imagePath.replace("/uploads", "");
      const filePathToDelete = path.join("uploads", name);
      deleteFile(filePathToDelete);
      var imagePath = `/uploads/${req.file.filename}`;
      await bookService.updateImagPath(req.params.id, imagePath);
    }
    return res.send(document);
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, "Có lỗi xảy ra trong quá trình cập nhật sách")
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const document = await bookService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại sách"));
    }
    if (document.imagePath) {
      let name = document.imagePath.replace("/uploads", "");
      const filePathToDelete = path.join("uploads", name);
      deleteFile(filePathToDelete);
    }
    return res.send({ messgae: "Xóa sách thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa sách với id ${req.params.id} `)
    );
  }
};
