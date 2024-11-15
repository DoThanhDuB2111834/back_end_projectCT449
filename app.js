const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

const publisherRoute = require("./app/routes/publisher.route");
const bookRoute = require("./app/routes/book.route");
const staffRoute = require("./app/routes/staff.route");
const authRouter = require("./app/routes/CustomeAuth.route");
const categoryRoute = require("./app/routes/categories.route");

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.use("/api/publisers", publisherRoute);
app.use("/api/books", bookRoute);
app.use("/api/staffs", staffRoute);
app.use("/api", authRouter);
app.use("/api/categories", categoryRoute);

app.use((req, res, next) => {
  return next(new ApiError(404, "resource not found"));
});

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
