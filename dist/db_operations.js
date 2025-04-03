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
const models_js_1 = require("./models.js");
//Funzione di errore per inserimento: stampa l'errore oppure un messaggio di controllo 
function handleError(err, control_message) {
    if (err) {
        console.log(err.message);
    }
    else {
        //console.log(control_message)
    }
}
//Funzione di errore per query: stampa l'errore oppure un messaggio di controllo
function handleQuery(err, rows, resolve, reject) {
    if (err) {
        console.log(err.message);
        reject(err);
    }
    else {
        resolve(rows);
    }
}
// Caricare i dati da un file JSON
function loadDataFromFile(path) {
    const data = fs_1.default.readFileSync(path, 'utf-8');
    return JSON.parse(data);
}
// Aprire il database
function openDatabase() {
    const db = new sqlite3_1.Database('musiconet.db', (err) => handleError(err, 'Database aperto correttamente'));
    return db;
}
// Chiudere il database
function closedDatabase(db) {
    return new Promise((resolve, reject) => {
        db.close((err) => handleError(err, 'Database chiuso correttamente'));
    });
}
// Creare le tabelle nel database
function createTable(db) {
    return __awaiter(this, void 0, void 0, function* () {
        db.serialize(() => {
            db.run(`
            CREATE TABLE IF NOT EXISTS user (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                surname TEXT NOT NULL,
                age INTEGER,
                city TEXT
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS event (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                location TEXT,
                date TEXT,
                description TEXT
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS genre (
                name TEXT PRIMARY KEY
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS instrument (
                name TEXT PRIMARY KEY
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS artist (
                id TEXT PRIMARY KEY,
                name TEXT
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS user_event (
                user_id INTEGER,
                event_id INTEGER,
                PRIMARY KEY(user_id, event_id),
                FOREIGN KEY(user_id) REFERENCES user(id),
                FOREIGN KEY(event_id) REFERENCES event(id)
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS user_genre (
                user_id INTEGER,
                genre TEXT,
                PRIMARY KEY(user_id, genre),
                FOREIGN KEY(user_id) REFERENCES user(id),
                FOREIGN KEY(genre) REFERENCES genre(name)
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS user_instrument (
                user_id INTEGER,
                instrument TEXT,
                PRIMARY KEY(user_id, instrument),
                FOREIGN KEY(user_id) REFERENCES user(id),
                FOREIGN KEY(instrument) REFERENCES instrument(name)
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS user_artist (
                user_id INTEGER,
                artist_id TEXT,
                PRIMARY KEY(user_id, artist_id),
                FOREIGN KEY(user_id) REFERENCES user(id),
                FOREIGN KEY(artist_id) REFERENCES artist(id)
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS event_genre (
                event_id INTEGER,
                genre TEXT,
                PRIMARY KEY(event_id, genre),
                FOREIGN KEY(event_id) REFERENCES event(id),
                FOREIGN KEY(genre) REFERENCES genre(name)
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS event_instrument (
                event_id INTEGER,
                instrument TEXT,
                PRIMARY KEY(event_id, instrument),
                FOREIGN KEY(event_id) REFERENCES event(id),
                FOREIGN KEY(instrument) REFERENCES instrument(name)
            )
        `);
            db.run(`
            CREATE TABLE IF NOT EXISTS event_artist (
                event_id INTEGER,
                artist_id TEXT,
                PRIMARY KEY(event_id, artist_id),
                FOREIGN KEY(event_id) REFERENCES event(id),
                FOREIGN KEY(artist_id) REFERENCES artist(id)
            )
        `);
        });
        console.log('Tabelle create correttamente');
    });
}
// Inserire un utente nel database
function insertUser(db, id, name, surname, age, city) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO user (id, name, surname, age, city) VALUES (?, ?, ?, ?, ?)`, [id, name, surname, age, city], (err) => handleError(err, `User ${name} inserito correttamente`));
    });
}
// Inserire un evento nel database
function insertEvent(db, id, name, location, date, description) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO event (id, name, location, date, description) VALUES (?, ?, ?, ?, ?)`, [id, name, location, date, description], (err) => handleError(err, `Evento ${name} inserito correttamente`));
    });
}
//Inserire un genere nel database
function insertGenre(db, name) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO genre (name) VALUES (?)`, [name], (err) => handleError(err, `Genere ${name} inserito correttamente`));
    });
}
//Inserire uno strumento nel database
function insertInstrument(db, name) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO instrument (name) VALUES (?)`, [name], (err) => handleError(err, `Strumento ${name} inserito correttamente`));
    });
}
//Inserire un artista nel database
function insertArtist(db, id, name) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO artist (id, name) VALUES (?, ?)`, [id, name], (err) => handleError(err, `Artista ${name} inserito correttamente`));
    });
}
// Inserire una relazione tra utente ed evento nel database
function insertUserEvent(db, user_id, event_id) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO user_event (user_id, event_id) VALUES (?, ?)`, [user_id, event_id], (err) => handleError(err, `Relazione tra utente ${user_id} e evento ${event_id} inserita correttamente`));
    });
}
//Inserire una relazione tra utente e genere nel database
function insertUserGenre(db, user_id, genre) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO user_genre (user_id, genre) VALUES (?, ?)`, [user_id, genre], (err) => handleError(err, `Relazione tra utente ${user_id} e genere ${genre} inserita correttamente`));
    });
}
// Inserire una relazione tra utente e strumento nel database
function insertUserInstrument(db, user_id, instrument) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO user_instrument (user_id, instrument) VALUES (?, ?)`, [user_id, instrument], (err) => handleError(err, `Relazione tra utente ${user_id} e strumento ${instrument} inserita correttamente`));
    });
}
// Inserire una relazione tra utente e artista nel database
function insertUserArtist(db, user_id, artist_id) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO user_artist (user_id, artist_id) VALUES (?, ?)`, [user_id, artist_id], (err) => handleError(err, `Relazione tra utente ${user_id} e artista ${artist_id} inserita correttamente`));
    });
}
//Inserire una relazione tra evento e genere nel database
function insertEventGenre(db, event_id, genre) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO event_genre (event_id, genre) VALUES (?, ?)`, [event_id, genre], (err) => handleError(err, `Relazione tra evento ${event_id} e genere ${genre} inserita correttamente`));
    });
}
// Inserire una relazione tra evento e strumento nel database
function insertEventInstrument(db, event_id, instrument) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO event_instrument (event_id, instrument) VALUES (?, ?)`, [event_id, instrument], (err) => handleError(err, `Relazione tra evento ${event_id} e strumento ${instrument} inserita correttamente`));
    });
}
// Inserire una relazione tra evento e artista nel database
function insertEventArtist(db, event_id, artist_id) {
    return __awaiter(this, void 0, void 0, function* () {
        db.run(`INSERT INTO event_artist (event_id, artist_id) VALUES (?, ?)`, [event_id, artist_id], (err) => handleError(err, `Relazione tra evento ${event_id} e artista ${artist_id} inserita correttamente`));
    });
}
// Eseguire una query sul database
function executeQuery(db_1, query_1) {
    return __awaiter(this, arguments, void 0, function* (db, query, params = []) {
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => handleQuery(err, rows, resolve, reject));
        });
    });
}
// Ottenere gli utenti dal database
function getUsers(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, `
        SELECT u.id, u.name, u.surname, u.age, u.city, 
               GROUP_CONCAT(DISTINCT g.name) AS genres,
               GROUP_CONCAT(DISTINCT i.name) AS instrument,
               GROUP_CONCAT(DISTINCT a.name) AS artists
        FROM user u
        LEFT JOIN user_instrument ui ON u.id = ui.user_id
        LEFT JOIN instrument i ON ui.instrument = i.name
        LEFT JOIN user_genre ug ON u.id = ug.user_id
        LEFT JOIN genre g ON ug.genre = g.name
        LEFT JOIN user_artist ua ON u.id = ua.user_id
        LEFT JOIN artist a ON ua.artist_id = a.id
        GROUP BY u.id`);
        return results.map(row => new models_js_1.User(row.id, row.name, row.surname, row.age, row.city, row.genres ? row.genres.split(",") : [], row.instrument !== null ? row.instrument : "Nessuno", row.artists ? row.artists.split(",") : []));
    });
}
// Ottenere gli eventi dal database
function getEvents(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, `
        SELECT e.id, e.name, e.location, e.date, e.description, 
               GROUP_CONCAT(DISTINCT g.name) AS genres,
               GROUP_CONCAT(DISTINCT i.name) AS instruments,
               GROUP_CONCAT(DISTINCT a.name) AS artists
        FROM event e
        LEFT JOIN event_instrument ei ON e.id = ei.event_id
        LEFT JOIN instrument i ON ei.instrument = i.name
        LEFT JOIN event_genre eg ON e.id = eg.event_id
        LEFT JOIN genre g ON eg.genre = g.name
        LEFT JOIN event_artist ea ON e.id = ea.event_id
        LEFT JOIN artist a ON ea.artist_id = a.id
        GROUP BY e.id`);
        return results.map(row => new models_js_1.Event(row.id, row.name, row.genres ? row.genres.split(",") : [], row.instruments ? row.instruments.split(",") : [], row.artists ? row.artists.split(",") : [], row.location, row.date, row.description));
    });
}
// Ottenere gli eventi di un utente dal database
function getUserEvents(db, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return executeQuery(db, `SELECT * FROM event WHERE event_id IN (SELECT event_id FROM user_event_relation WHERE user_id = ?)`, [user_id]);
    });
}
// Popolare il database con i dati iniziali
function populate(db) {
    return __awaiter(this, void 0, void 0, function* () {
        yield executeQuery(db, `BEGIN TRANSACTION`);
        try {
            // Inserimento degli user da ./data/user.json
            const dataUsers = yield loadDataFromFile('./data/user.json');
            for (const user of dataUsers) {
                yield insertUser(db, user.id, user.name, user.surname, user.age, user.position);
            }
            // Inserimento degli eventi da ./data/event.json
            const dataEvents = yield loadDataFromFile('./data/event.json');
            for (const event of dataEvents) {
                yield insertEvent(db, event.id, event.name, event.location, event.date, event.description);
            }
            //Inserimento dei generi da ./data/genre.json
            const dataGenres = yield loadDataFromFile('./data/genre.json');
            for (const genre of dataGenres) {
                yield insertGenre(db, genre.name);
            }
            //Inserimento dei strumenti da ./data/instrument.json
            const dataInstruments = yield loadDataFromFile('./data/instrument.json');
            for (const instrument of dataInstruments) {
                yield insertInstrument(db, instrument.name);
            }
            //Inserimento degli artisti da ./data/artist.json
            const dataArtists = yield loadDataFromFile('./data/artist.json');
            for (const artist of dataArtists) {
                yield insertArtist(db, artist.id, artist.name);
            }
            // Inserimento delle relazioni tra utenti ed eventi da ./data/user_event.json
            const dataUserEvent = yield loadDataFromFile('./data/user_event.json');
            for (const relation of dataUserEvent) {
                yield insertUserEvent(db, relation.user_id, relation.event_id);
            }
            // Inserimento delle relazioni tra utenti e generi da ./data/user_genre.json
            const dataUserGenre = yield loadDataFromFile('./data/user_genre.json');
            for (const relation of dataUserGenre) {
                yield insertUserGenre(db, relation.user_id, relation.genre);
            }
            // Inserimento delle relazioni tra utenti e strumenti da ./data/user_instrument.json
            const dataUserInstrument = yield loadDataFromFile('./data/user_instrument.json');
            for (const relation of dataUserInstrument) {
                yield insertUserInstrument(db, relation.user_id, relation.instrument);
            }
            // Inserimento delle relazioni tra utenti e artisti da ./data/user_artist.json
            const dataUserArtist = yield loadDataFromFile('./data/user_artist.json');
            for (const relation of dataUserArtist) {
                yield insertUserArtist(db, relation.user_id, relation.artist_id);
            }
            //Inserimento delle relazioni tra eventi e generi da ./data/event_genre.json
            const dataEventGenre = yield loadDataFromFile('./data/event_genre.json');
            for (const relation of dataEventGenre) {
                yield insertEventGenre(db, relation.event_id, relation.genre);
            }
            //Inserimento delle relazioni tra eventi e strumenti da ./data/event_genre.json
            const dataEventInstrument = yield loadDataFromFile('./data/event_instrument.json');
            for (const relation of dataEventInstrument) {
                yield insertEventInstrument(db, relation.event_id, relation.instrument);
            }
            //Inserimento delle relazioni tra eventi e artisti da ./data/event_artist.json
            const dataEventArtist = yield loadDataFromFile('./data/event_artist.json');
            for (const relation of dataEventArtist) {
                yield insertEventArtist(db, relation.event_id, relation.artist_id);
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
exports.default = { openDatabase, closedDatabase, createTable, insertUser, insertEvent, insertUserEvent, executeQuery, getUsers, getEvents, getUserEvents, populate };
