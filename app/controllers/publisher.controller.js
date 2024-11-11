const ApiError = require("../api-error");
const PublisherService = require("../services/publishers.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  if (!req.body?.name) {
    return next(new Error(400, "Tên nhà xuất bản không được rỗng"));
  }
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra trong quá trình tạo nhà xuất bản")
    );
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];

  try {
    const publisherService = new PublisherService(MongoDB.client);
    documents = await publisherService.findAll();
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra khi lấy dữ liệu tất cả nhà xuất bản")
    );
  }

  return res.send(documents);
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new Error(400, "Dữ liệu cập nhật không được rỗng"));
  }

  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại nhà xuất bản"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "Có lỗi xảy ra trong quá trình cập nhật nhà xuất bản")
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const publiserService = new PublisherService(MongoDB.client);
    const document = await publiserService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại nhà xuất bản"));
    }
    return res.send({ messgae: "Xóa nhà xuất bản thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Không thể xóa nhà xuất bản với id ${req.params.id} `)
    );
  }
};

exports.findById = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tồn tại nhà xuất bản"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi khi truy xuất nhà xuất bản với id ${req.params.id}`
      )
    );
  }
};
