const express = require("express");
const readers = require("../controllers/reader.controller");

const router = express.Router();

router.route("/").get(readers.findAll).post(readers.create);

router
  .route("/:id")
  .get(readers.findById)
  .put(readers.update)
  .delete(readers.delete);

module.exports = router;
