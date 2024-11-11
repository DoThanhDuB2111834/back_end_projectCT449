const { ObjectId, ReturnDocument } = require("mongodb");

class StaffService {
  constructor(client) {
    this.Staff = client.db().collection("staffs");
  }

  extractConactData(payload) {
    const staff = {
      name: payload.name,
      password: payload.password,
      role: payload.role,
      address: payload.address,
      phoneNumber: payload.phoneNumber,
    };

    Object.keys(staff).forEach(
      (key) => staff[key] === undefined && delete staff[key]
    );
    return staff;
  }

  async create(payload) {
    const staff = this.extractConactData(payload);
    const result = await this.Staff.findOneAndUpdate(
      staff,
      { $set: {} },
      {
        returnDocument: ReturnDocument.AFTER,
        upsert: true,
      }
    );

    return result;
  }

  async findAll() {
    const cursor = await this.Staff.find({});
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.Staff.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = this.extractConactData(payload);
    const result = await this.Staff.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }
}

module.exports = StaffService;
