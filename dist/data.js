"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTable = createTable;
exports.insertUser = insertUser;
exports.insertEvent = insertEvent;
exports.insertUserEventRelation = insertUserEventRelation;
exports.getUsers = getUsers;
exports.getEvents = getEvents;
exports.getUserEvents = getUserEvents;
const sqlite3_1 = __importDefault(require("sqlite3"));
const db = new sqlite3_1.default.Database('musiconet.db');
function createTable() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                cognome TEXT NOT NULL,
                age INTEGER,
                genres TEXT,
                instrument TEXT,
                artists TEXT,
                position TEXT
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS events (
                event_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                date DATE,
                genres TEXT,
                artists TEXT,
                location TEXT
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS user_event_relation (
                user_id INTEGER,
                event_id INTEGER,
                PRIMARY KEY(user_id, event_id),
                FOREIGN KEY(user_id) REFERENCES users(user_id),
                FOREIGN KEY(event_id) REFERENCES events(event_id)
            )
        `);
    });
    db.close();
}
function insertUser(name, age, genres, instrument, artists, position) {
    db.run(`INSERT INTO users (name, age, genres, instrument, artists, position) VALUES (?, ?, ?, ?, ?, ?)`, [name, age, genres.join(','), instrument, artists.join(','), position], (err) => {
        if (err) {
            console.log(err.message);
        }
        else {
            console.log(`User ${name} inserito correttamente`);
        }
    });
    db.close();
}
function insertEvent(name, date, genres, artists, location) {
    db.run(`INSERT INTO events (name, date, genres, artists, location) VALUES (?, ?, ?, ?, ?)`, [name, date, genres.join(','), artists.join(','), location], (err) => {
        if (err) {
            console.log(err.message);
        }
        else {
            console.log(`Evento ${name} inserito correttamente`);
        }
    });
    db.close();
}
function insertUserEventRelation(user_id, event_id) {
    db.run(`INSERT INTO user_event_relation (user_id, event_id) VALUES (?, ?)`, [user_id, event_id], (err) => {
        if (err) {
            console.log(err.message);
        }
        else {
            console.log(`Relazione tra utente ${user_id} e evento ${event_id} inserita correttamente`);
        }
    });
    db.close();
}
function getUsers() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM users`, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
function getEvents() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM events`, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
function getUserEvents(user_id) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM events WHERE event_id IN (SELECT event_id FROM user_event_relation WHERE user_id = ?)`, [user_id], (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}
