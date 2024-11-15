const { ObjectId, ReturnDocument } = require("mongodb");

class CategoryService {
  constructor(client) {
    this.Category = client.db().collection("categories");
  }

  async create(payload) {
    const category = {
      name: payload.name,
    };
    const result = await this.Category.findOneAndUpdate(
      category,
      { $set: {} },
      {
        returnDocument: ReturnDocument.AFTER,
        upsert: true,
      }
    );

    return result;
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = { name: payload.name };
    const result = await this.Category.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async findAll() {
    const cursor = await this.Category.find({}).toArray();
    return cursor;
  }

  async findById(id) {
    return await this.Category.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async delete(id) {
    const result = await this.Category.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = CategoryService;
