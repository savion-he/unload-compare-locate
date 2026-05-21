const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new Database(path.join(dataDir, "records.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id       TEXT PRIMARY KEY,
    env      TEXT NOT NULL,
    data     TEXT NOT NULL,
    raw      TEXT,
    saved_at TEXT NOT NULL
  )
`);

module.exports = db;
