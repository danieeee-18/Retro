class Database {
  static #db = null;

  constructor() {
    throw new Error("Usa Database.getInstance()");
  }

  static getInstance(dbPath) {
    if (Database.#db == null) {
      if (!dbPath) throw new Error("Se requiere dbPath");
      
      const BetterSqlite3 = require("better-sqlite3");
      Database.#db = new BetterSqlite3(dbPath);
      
      // Inicializadores
      require("./initialize-tareas")(Database.#db);
      require("./initialize-usuarios")(Database.#db);
    }
    return Database.#db;
  }

  static prepare(sql) {
    return Database.#db.prepare(sql);
  }
}
module.exports = Database;