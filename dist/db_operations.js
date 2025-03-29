"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = require("sqlite3");
const fs_1 = __importDefault(require("fs"));
// Caricare i dati da un file JSON
function loadDataFromFile(path) {
    const data = fs_1.default.readFileSync(path, 'utf-8');
    return JSON.parse(data);
}
// Aprire il database
function openDatabase() {
    const db = new sqlite3_1.Database('musiconet.db', (err) => {
        if (err) {
            console.log('Errore nell\'apertura del database: ' + err.message);
        }
        else {
            console.log('Database aperto correttamente');
        }
    });
    return db;
}
// Chiudere il database
function closedDatabase(db) {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.log('Errore nella chiusura del database: ' + err.message);
                reject(err);
            }
            else {
                console.log('Database chiuso correttamente');
                resolve(true);
            }
        });
    });
}
// Creare le tabelle nel database
function createTable(db) {
    return __awaiter(this, void 0, void 0, function* () {
        db.serialize(() => {
            db.run(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                surname TEXT NOT NULL,
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
        console.log('Tabelle create correttamente');
    });
}
// Inserire un utente nel database
function insertUser(db, name, surname, age, genres, instrument, artists, position) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO users (name, surname, age, genres, instrument, artists, position) VALUES (?, ?, ?, ?, ?, ?, ?)`, [name, surname, age, JSON.stringify(genres), instrument, JSON.stringify(artists), position], (err) => {
            if (err) {
                console.log(err.message);
                console.log(`Errore nell'inserimento`);
            }
            else {
                console.log(`User ${name} inserito correttamente`);
            }
        });
    });
}
// Inserire un evento nel database
function insertEvent(db, name, date, genres, artists, location) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO events (name, date, genres, artists, location) VALUES (?, ?, ?, ?, ?)`, [name, date, JSON.stringify(genres), JSON.stringify(artists), location], (err) => {
            if (err) {
                console.log(err.message);
            }
            else {
                console.log(`Evento ${name} inserito correttamente`);
            }
        });
    });
}
// Inserire una relazione tra utente ed evento nel database
function insertUserEventRelation(db, user_id, event_id) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO user_event_relation (user_id, event_id) VALUES (?, ?)`, [user_id, event_id], (err) => {
            if (err) {
                console.log(err.message);
            }
            else {
                console.log(`Relazione tra utente ${user_id} e evento ${event_id} inserita correttamente`);
            }
        });
    });
}
// Eseguire una query sul database
function executeQuery(db_1, query_1) {
    return __awaiter(this, arguments, void 0, function* (db, query, params = []) {
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    });
}
// Ottenere gli utenti dal database
function getUsers(db) {
    return __awaiter(this, void 0, void 0, function* () {
        return executeQuery(db, `SELECT * FROM users`);
    });
}
// Ottenere gli eventi dal database
function getEvents(db) {
    return __awaiter(this, void 0, void 0, function* () {
        return executeQuery(db, `SELECT * FROM events`);
    });
}
// Ottenere gli eventi di un utente dal database
function getUserEvents(db, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return executeQuery(db, `SELECT * FROM events WHERE event_id IN (SELECT event_id FROM user_event_relation WHERE user_id = ?)`, [user_id]);
    });
}
// Popolare il database con i dati iniziali
function populate(db) {
    return __awaiter(this, void 0, void 0, function* () {
        yield executeQuery(db, `BEGIN TRANSACTION`);
        try {
            // Inserimento degli user da ./data/users.json
            const dataUsers = yield loadDataFromFile('./data/users.json');
            for (const user of dataUsers) {
                yield insertUser(db, user.name, user.surname, user.age, user.genres, user.instrument, user.artists, user.position);
            }
            // Inserimento degli eventi da ./data/events.json
            const dataEvents = yield loadDataFromFile('./data/events.json');
            for (const event of dataEvents) {
                yield insertEvent(db, event.name, event.date, event.genres, event.artists, event.location);
            }
            // Inserimento delle relazioni tra utenti ed eventi da ./data/user_event_relation.json
            const dataUserEvent = yield loadDataFromFile('./data/user_event_relation.json');
            for (const relation of dataUserEvent) {
                yield insertUserEventRelation(db, relation.user_id, relation.event_id);
            }
            yield executeQuery(db, `COMMIT`);
        }
        catch (err) {
            yield executeQuery(db, `ROLLBACK`);
            console.error("Errore in populate: " + err);
        }
    });
}
// Test per stampare i dati
function printData() {
    return __awaiter(this, void 0, void 0, function* () {
        const db = openDatabase();
        try {
            //await createTable(db)
            //await populate(db)
            const users = yield getUsers(db);
            console.log(users);
            const events = yield getEvents(db);
            console.log(events);
            const userEvents = yield getUserEvents(db, 1);
            console.log(userEvents);
        }
        catch (err) {
            console.error("Errore in printData: " + err);
        }
        finally {
            yield closedDatabase(db);
        }
    });
}
//printData()
exports.default = { openDatabase, closedDatabase, createTable, insertUser, insertEvent, insertUserEventRelation, executeQuery, getUsers, getEvents, getUserEvents, populate };
