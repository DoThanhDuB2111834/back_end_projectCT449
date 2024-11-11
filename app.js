const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const publisherRoute = require("./app/routes/publisher.route");

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

app.use("/publisers", publisherRoute);

module.exports = app;
