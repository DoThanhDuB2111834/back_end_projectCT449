const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");
const manageBorrows = require("./app/controllers/manageBorrowsBook.controller");

async function startServer() {
  try {
    await MongoDB.connect(config.db.url);
    console.log("Connected to the database!");

    const PORT = config.app.port;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    const checkEveryHour = async () => {
      await manageBorrows.checkLateDeadline();
    };

    // Gọi hàm `checkEveryHour` mỗi giờ
    setInterval(checkEveryHour, 3600000);

    // Gọi hàm `checkEveryHour` ngay lập tức khi khởi động
    checkEveryHour();
  } catch (error) {
    console.log("Cannot connect to the database!", error);
    process.exit(1);
  }
}

startServer();
