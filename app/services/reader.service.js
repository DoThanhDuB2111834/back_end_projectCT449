const { ObjectId, ReturnDocument } = require("mongodb");

class ReaderService {
  constructor(client) {
    this.Reader = client.db().collection("readers");
  }

  extractConactData(payload) {
    const reader = {
      surname: payload.surname,
      name: payload.name,
      birthdate: payload.birthdate,
      gender: payload.gender,
      address: payload.address,
      phoneNumber: payload.phoneNumber,
    };

    Object.keys(reader).forEach(
      (key) => reader[key] === undefined && delete reader[key]
    );
    return reader;
  }

  async create(payload) {
    const reader = this.extractConactData(payload);
    const result = await this.Reader.findOneAndUpdate(
      reader,
      { $set: {} },
      {
        returnDocument: ReturnDocument.AFTER,
        upsert: true,
      }
    );

    return result;
  }

  async findAll() {
    const cursor = await this.Reader.find({});
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.Reader.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findByKeyword(keyword) {
    const query = { surname: { $regex: `.*${keyword}.*`, $options: "i" } };
    const cursor = await this.Reader.find(query);
    return await cursor.toArray();
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = this.extractConactData(payload);
    const result = await this.Reader.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async delete(id) {
    const result = await this.Reader.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = ReaderService;
