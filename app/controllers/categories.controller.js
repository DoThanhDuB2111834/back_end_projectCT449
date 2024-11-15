const ApiError = require("../api-error");
const CategoryService = require("../services/categories.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  try {
    const categoryService = new CategoryService(MongoDB.client);
    const document = await categoryService.create(req.body);
    return res.send(document);
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "Lỗi xảy ra trong quá trình tạo danh mục"));
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new Error(400, "Dữ liệu cập nhật không được rỗng"));
  }

  try {
    const categoryService = new CategoryService(MongoDB.client);
    const document = await categoryService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại danh mục"));
    }

    return res.send(document);
  } catch (error) {
    console.error(error);
    return next(
      new ApiError(500, "Có lỗi xảy ra trong quá trình cập nhật sách")
    );
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const categoryService = new CategoryService(MongoDB.client);
    documents = await categoryService.findAll();
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra khi lấy dữ liệu tất cả danh mục")
    );
  }

  return res.send(documents);
};

exports.findById = async (req, res, next) => {
  try {
    const categoryService = new CategoryService(MongoDB.client);
    const document = await categoryService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại danh mục"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi truy xuất danh mục với id ${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const categoryService = new CategoryService(MongoDB.client);
    const document = await categoryService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại danh mục"));
    }
    return res.send({ messgae: "Xóa danh mục thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa danh mục với id ${req.params.id} `)
    );
  }
};
