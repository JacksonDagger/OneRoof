module.exports = {
  test: {
    client: "sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: "dev.sqlite3",
      database: "dev_oneroof",
      migrations: {
          directory: __dirname + "/migrations"
      },
      seeds: {
          directory: __dirname + "/seeds"
      },
    }
  },
};
