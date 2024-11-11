const { ObjectId, ReturnDocument } = require("mongodb");

class PublisherService {
  constructor(client) {
    this.publisher = client.db().collection("publishers");
  }

  extractConactData(payload) {
    const publiser = {
      name: payload.name,
      address: payload.address,
    };

    Object.keys(publiser).forEach(
      (key) => publiser[key] === undefined && delete publiser[key]
    );
    return publiser;
  }

  async create(payload) {
    const publiser = this.extractConactData(payload);
    const result = await this.publisher.findOneAndUpdate(
      publiser,
      { $set: { name: publiser.name, address: publiser.address } },
      {
        returnDocument: ReturnDocument.AFTER,
        upsert: true,
      }
    );

    return result;
  }

  async findAll() {
    const cursor = await this.publisher.find({});
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.publisher.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = this.extractConactData(payload);
    const result = await this.publisher.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async delete(id) {
    const result = await this.publisher.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }
}

module.exports = PublisherService;
