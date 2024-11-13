const { ObjectId, ReturnDocument } = require("mongodb");
const bcrypt = require("bcrypt");

async function hashPassword(password) {
  try {
    // Số lượng salt rounds (tăng độ bảo mật)
    const saltRounds = 10;

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("Hashed Password:", hashedPassword);
    return hashedPassword;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

class StaffService {
  constructor(client) {
    this.Staff = client.db().collection("staffs");
  }

  async extractConactData(payload) {
    var hashedPassword = await hashPassword(payload.password);
    const staff = {
      username: payload.username,
      name: payload.name,
      password: hashedPassword,
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
    const staff = await this.extractConactData(payload);
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

    const update = await this.extractConactData(payload);
    const result = await this.Staff.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  async findOne(username) {
    return await this.Staff.findOne({
      username: username,
    });
  }
}

module.exports = StaffService;
