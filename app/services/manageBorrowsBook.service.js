const { ObjectId, ReturnDocument } = require("mongodb");
const ReaderService = require("./reader.service");
const bookService = require("./book.service");

class ManageBorrowService {
  constructor(client) {
    this.ManageBorrow = client.db().collection("manage_borrows_book");
  }

  extractConactData(payload, userId) {
    const publiser = {
      readerId: new ObjectId(payload.readerId),
      bookId: new ObjectId(payload.bookId),
      dateBorrow: payload.dateBorrow,
      dateReturn: payload.dateReturn,
      state: payload.state ?? "Đang mượn",
      staffId: userId ? new ObjectId(userId) : undefined,
    };

    Object.keys(publiser).forEach(
      (key) => publiser[key] === undefined && delete publiser[key]
    );
    return publiser;
  }

  async create(payload, userId) {
    const document = this.extractConactData(payload, userId);
    await this.ManageBorrow.createIndex(
      { readerId: 1, bookId: 1, dateBorrow: 1 },
      { unique: true }
    );
    const result = await this.ManageBorrow.insertOne(document);

    return result;
  }

  async clientBorrow(payload) {
    readerDocument = await ReaderService.create(payload);
  }

  async findAll() {
    const cursor = await this.ManageBorrow.aggregate([
      {
        $lookup: {
          from: "books", // Tên của collection cần tham chiếu
          localField: "bookId", // Trường trong collection hiện tại
          foreignField: "_id", // Trường trong collection cần tham chiếu
          as: "book", // Tên trường kết quả sau khi tham chiếu
        },
      },
      {
        $lookup: {
          from: "readers", // Tên của collection cần tham chiếu
          localField: "readerId", // Trường trong collection hiện tại
          foreignField: "_id", // Trường trong collection cần tham chiếu
          as: "reader", // Tên trường kết quả sau khi tham chiếu
        },
      },
      {
        $lookup: {
          from: "staffs", // Tên của collection cần tham chiếu
          localField: "staffId", // Trường trong collection hiện tại
          foreignField: "_id", // Trường trong collection cần tham chiếu
          as: "staff", // Tên trường kết quả sau khi tham chiếu
        },
      },
    ]).toArray();
    return await cursor;
  }

  async findById(id) {
    const cursor = await this.ManageBorrow.aggregate([
      {
        $match: { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      },
      {
        $lookup: {
          from: "readers", // Tên của collection cần tham chiếu
          localField: "readerId", // Trường trong collection hiện tại
          foreignField: "_id", // Trường trong collection cần tham chiếu
          as: "reader", // Tên trường kết quả sau khi tham chiếu
        },
      },
      {
        $lookup: {
          from: "books", // Tên của collection cần tham chiếu
          localField: "bookId", // Trường trong collection hiện tại
          foreignField: "_id", // Trường trong collection cần tham chiếu
          as: "book", // Tên trường kết quả sau khi tham chiếu
        },
      },
      {
        $lookup: {
          from: "staffs", // Tên của collection cần tham chiếu
          localField: "staffId", // Trường trong collection hiện tại
          foreignField: "_id", // Trường trong collection cần tham chiếu
          as: "staff", // Tên trường kết quả sau khi tham chiếu
        },
      },
    ]);

    const result = await cursor.toArray();
    return result.length ? result[0] : null;
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = this.extractConactData(payload);
    const result = await this.ManageBorrow.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async delete(id) {
    const result = await this.ManageBorrow.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = ManageBorrowService;
