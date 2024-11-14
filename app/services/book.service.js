const { ObjectId, ReturnDocument } = require("mongodb");

class BookService {
  constructor(client) {
    this.Book = client.db().collection("books");
  }

  extractConactData(payload, imagePath) {
    const book = {
      name: payload.name,
      price: payload.price,
      quantity: payload.quantity,
      publicationYear: payload.publicationYear,
      publisherId: new ObjectId(payload.publisherId),
      author: payload.author,
      imagePath: imagePath,
    };

    Object.keys(book).forEach(
      (key) => book[key] === undefined && delete book[key]
    );
    return book;
  }

  async create(payload, imagePath) {
    const book = this.extractConactData(payload, imagePath);
    const result = await this.Book.findOneAndUpdate(
      book,
      { $set: {} },
      {
        returnDocument: ReturnDocument.AFTER,
        upsert: true,
      }
    );

    return result;
  }

  async findAll() {
    const cursor = await this.Book.aggregate([
      {
        $lookup: {
          from: "publishers", // Tên của collection cần tham chiếu
          localField: "publisherId", // Trường trong collection hiện tại
          foreignField: "_id", // Trường trong collection cần tham chiếu
          as: "publisher", // Tên trường kết quả sau khi tham chiếu
        },
      },
    ]).toArray();
    // cursor.toArray.forEach((book) => console.log(book));
    return cursor;
  }

  async findById(id) {
    return await this.Book.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = this.extractConactData(payload);
    const result = await this.Book.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async updateImagPath(id, imagePath) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const result = await this.Book.findOneAndUpdate(
      filter,
      { $set: { imagePath: imagePath } },
      { returnDocument: "after" }
    );

    return result;
  }

  async delete(id) {
    const result = await this.Book.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = BookService;
