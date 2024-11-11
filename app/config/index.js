const config = {
  app: {
    port: process.env.PORT || 3000,
  },
  db: {
    url: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/project_CT449",
  },
};

module.exports = config;
