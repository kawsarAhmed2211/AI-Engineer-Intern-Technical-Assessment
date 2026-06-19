const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./weather.db");

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS weather_searches (
                                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        location TEXT NOT NULL,
                                                        country TEXT,
                                                        temperature REAL,
                                                        searchDate TEXT
        )
    `);

});

module.exports = db;