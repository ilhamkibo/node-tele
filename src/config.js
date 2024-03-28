const sqlite3 = require("sqlite3").verbose();

// Database configuration
const db = new sqlite3.Database("user.db");

// Create a new logs table with 'penuh' as the default value for the logs column
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, user_id INTEGER, first_name TEXT, username TEXT, timestamp DATETIME DEFAULT (datetime('now', 'localtime')))"
  );
});

// Create a new temperature table
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS temperature (id INTEGER PRIMARY KEY, room_id INTEGER, value REAL, timestamp DATETIME DEFAULT (datetime('now', 'localtime')), FOREIGN KEY (room_id) REFERENCES rooms(id))"
  );
});

// Create a new rooms table
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY, name TEXT)"
  );
});

module.exports = db;
