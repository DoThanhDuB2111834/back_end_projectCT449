const express = require("express");
const books = require("../controllers/books.controller");
const ApiError = require("../api-error");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu trữ file
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Lưu file với thời gian hiện tại để tránh trùng tên
  },
});

const upload = multer({ storage: storage });

// router.all("*", upload.single("image"), (req, res, next) => {
//   if (req.method === "POST" || req.method === "PUT") {
//     if (!req.body?.name) {
//       return next(new ApiError(400, "Tên không được rỗng"));
//     } else if (!req.body?.price || req.body?.price <= 0) {
//       return next(new ApiError(400, "Giá sách phải lớn hơn 0"));
//     } else if (!req.body?.quantity || req.body?.quantity <= 0) {
//       return next(new ApiError(400, "Số lượng sách phải lớn hơn 0"));
//     } else if (!req.body?.publisherId) {
//       return next(new ApiError(400, "Nhà xuất bản không được rỗng"));
//     }
//   }
//   console.log(req.body);
//   return next();
// });

router.route("/").get(books.findAll).post(upload.single("image"), books.create);

router
  .route("/:id")
  .get(books.findById)
  .put(upload.single("image"), books.update)
  .delete(books.delete);

module.exports = router;
