const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error");

const app = express();
app.use(cors());
app.use(express.json());

const publisherRoute = require("./app/routes/publisher.route");

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.use("/api/publisers", publisherRoute);

app.use((req, res, next) => {
  return next(new ApiError(404, "resource not found"));
});

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
