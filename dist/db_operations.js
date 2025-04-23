"use strict";
/*  Gestione del database
    Funzioni necessarie per creare, inserire dati e interrogare il database
*/
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
// Caricare i dati da un file JSON
function loadDataFromFile(path) {
    const data = fs_1.default.readFileSync(path, 'utf-8');
    return JSON.parse(data);
}
// Gestire le CallBack nelle varie operazioni al Database
// Input: errore, funzione di risoluzione, funzione di rifiuto, dati di successo (opzionale), messaggio di controllo (opzionale)
function handleDBCallBack(err, resolve, reject, success_data, control_message) {
    if (err) {
        console.error(err.message);
        reject(err);
    }
    else {
        control_message ? console.log(control_message) : null;
        resolve(success_data);
    }
}
// Aprire il database
function openDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3_1.Database(`musiconet.db`, (err) => handleDBCallBack(err, resolve, reject, db));
    });
}
// Chiudere il database
function closeDatabase(db) {
    return new Promise((resolve, reject) => {
        db.close((err) => handleDBCallBack(err, resolve, reject));
    });
}
// Eseguire una query di tipo INSERT, CREATE 
function runAsync(db_1, sql_1) {
    return __awaiter(this, arguments, void 0, function* (db, sql, params = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, (err) => handleDBCallBack(err, resolve, reject));
        });
    });
}
// Creare le tabelle nel database
function createTable(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const run = (sql) => runAsync(db, sql); //Creazione di un alias più corto per la funzione runAsync
        try {
            // Creazione tabella user
            yield run(`
    	    CREATE TABLE IF NOT EXISTS user (
    	        id INTEGER PRIMARY KEY,
    	        name TEXT NOT NULL,
    	        surname TEXT NOT NULL,
    	        age INTEGER,
    	        city TEXT
    	    )
    	`);
            // Creazione tabella event
            yield run(`
    	    CREATE TABLE IF NOT EXISTS event (
    	        id INTEGER PRIMARY KEY,
    	        name TEXT NOT NULL,
    	        location TEXT,
    	        date TEXT,
    	        description TEXT
    	    )
    	`);
            // Creazione tabelle genre, instrument e artist
            yield run(`CREATE TABLE IF NOT EXISTS genre (name TEXT PRIMARY KEY)`);
            yield run(`CREATE TABLE IF NOT EXISTS instrument (name TEXT PRIMARY KEY)`);
            yield run(`
    	    CREATE TABLE IF NOT EXISTS artist (
    	        id INTEGER PRIMARY KEY,
    	        name TEXT
    	    )
    	`);
            // Creazione tabella per relazione tra utenti ed eventi
            yield run(`
            CREATE TABLE IF NOT EXISTS user_event (
                user_id INTEGER,
                event_id INTEGER,
                PRIMARY KEY(user_id, event_id),
                FOREIGN KEY(user_id) REFERENCES user(id),
                FOREIGN KEY(event_id) REFERENCES event(id)
            )
        `);
            // Creazione tabella per relazioni tra utenti e generi
            yield run(`
            CREATE TABLE IF NOT EXISTS user_genre (
                user_id INTEGER,
                genre TEXT,
                PRIMARY KEY(user_id, genre),
                FOREIGN KEY(user_id) REFERENCES user(id),
                FOREIGN KEY(genre) REFERENCES genre(name)
            )
        `);
            // Creazione tabella per relazioni tra utenti e strumenti
            yield run(`
    	    CREATE TABLE IF NOT EXISTS user_instrument (
    	        user_id INTEGER,
    	        instrument TEXT,
    	        PRIMARY KEY(user_id, instrument),
    	        FOREIGN KEY(user_id) REFERENCES user(id),
    	        FOREIGN KEY(instrument) REFERENCES instrument(name)
    	    )
    	`);
            // Creazione tabella per relazioni tra utenti e artisti
            yield run(`
    	    CREATE TABLE IF NOT EXISTS user_artist (
    	        user_id INTEGER,
    	        artist_id INTEGER,
    	        PRIMARY KEY(user_id, artist_id),
    	        FOREIGN KEY(user_id) REFERENCES user(id),
    	        FOREIGN KEY(artist_id) REFERENCES artist(id)
    	    )
    	`);
            // Creazione tabella per relazioni tra eventi e generi
            yield run(`
    	    CREATE TABLE IF NOT EXISTS event_genre (
    	        event_id INTEGER,
    	        genre TEXT,
    	        PRIMARY KEY(event_id, genre),
    	        FOREIGN KEY(event_id) REFERENCES event(id),
    	        FOREIGN KEY(genre) REFERENCES genre(name)
    	    )
    	`);
            // Creazione tabella per relazioni tra eventi e strumenti
            yield run(`
    	    CREATE TABLE IF NOT EXISTS event_instrument (
    	        event_id INTEGER,
    	        instrument TEXT,
    	        PRIMARY KEY(event_id, instrument),
    	        FOREIGN KEY(event_id) REFERENCES event(id),
    	        FOREIGN KEY(instrument) REFERENCES instrument(name)
    	    )
    	`);
            // Creazione tabella per relazioni tra eventi e artisti
            yield run(`
    	    CREATE TABLE IF NOT EXISTS event_artist (
    	        event_id INTEGER,
    	        artist_id INTEGER,
    	        PRIMARY KEY(event_id, artist_id),
    	        FOREIGN KEY(event_id) REFERENCES event(id),
    	        FOREIGN KEY(artist_id) REFERENCES artist(id)
    	    )
    	`);
        }
        catch (err) {
            console.error("Errore in createTable: ", err.message);
            throw err;
        }
    });
}
// Inserire un utente nel database
function insertUser(db, id, name, surname, age, city) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO user (id, name, surname, age, city) VALUES (?, ?, ?, ?, ?)`;
        const params = [id, name, surname, age, city];
        return runAsync(db, sql, params);
    });
}
// Inserire un evento nel database
function insertEvent(db, id, name, location, date, description) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO event (id, name, location, date, description) VALUES (?, ?, ?, ?, ?)`;
        const params = [id, name, location, date, description];
        return runAsync(db, sql, params);
    });
}
//Inserire un genere nel database
function insertGenre(db, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO genre (name) VALUES (?)`;
        const params = [name];
        return runAsync(db, sql, params);
    });
}
//Inserire uno strumento nel database
function insertInstrument(db, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO instrument (name) VALUES (?)`;
        const params = [name];
        return runAsync(db, sql, params);
    });
}
//Inserire un artista nel database
function insertArtist(db, id, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO artist (id, name) VALUES (?, ?)`;
        const params = [id, name];
        return runAsync(db, sql, params);
    });
}
// Inserire una relazione tra utente ed evento nel database
function insertUserEvent(db, user_id, event_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO user_event (user_id, event_id) VALUES (?, ?)`;
        const params = [user_id, event_id];
        return runAsync(db, sql, params);
    });
}
//Inserire una relazione tra utente e genere nel database
function insertUserGenre(db, user_id, genre) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO user_genre (user_id, genre) VALUES (?, ?)`;
        const params = [user_id, genre];
        return runAsync(db, sql, params);
    });
}
// Inserire una relazione tra utente e strumento nel database
function insertUserInstrument(db, user_id, instrument) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO user_instrument (user_id, instrument) VALUES (?, ?)`;
        const params = [user_id, instrument];
        return runAsync(db, sql, params);
    });
}
// Inserire una relazione tra utente e artista nel database
function insertUserArtist(db, user_id, artist_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO user_artist (user_id, artist_id) VALUES (?, ?)`;
        const params = [user_id, artist_id];
        return runAsync(db, sql, params);
    });
}
//Inserire una relazione tra evento e genere nel database
function insertEventGenre(db, event_id, genre) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO event_genre (event_id, genre) VALUES (?, ?)`;
        const params = [event_id, genre];
        return runAsync(db, sql, params);
    });
}
// Inserire una relazione tra evento e strumento nel database
function insertEventInstrument(db, event_id, instrument) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO event_instrument (event_id, instrument) VALUES (?, ?)`;
        const params = [event_id, instrument];
        return runAsync(db, sql, params);
    });
}
// Inserire una relazione tra evento e artista nel database
function insertEventArtist(db, event_id, artist_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const sql = `INSERT INTO event_artist (event_id, artist_id) VALUES (?, ?)`;
        const params = [event_id, artist_id];
        return runAsync(db, sql, params);
    });
}
// Eseguire una query di tipo SELECT
function executeQuery(db_1, query_1) {
    return __awaiter(this, arguments, void 0, function* (db, query, params = []) {
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => handleDBCallBack(err, resolve, reject, rows));
        });
    });
}
// Ottenere tutti gli id utenti e gli id eventi seguiti da ciascuno (utilizzato in cf)
function getAllUsersEvents(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, `SELECT user_id, GROUP_CONCAT(event_id) AS events FROM user_event GROUP BY user_id`);
        const map = new Map();
        for (const row of results) {
            // Creare una mappa per ogni utente con gli eventi seguiti
            map.set(row.user_id, new Set(row.events.split(",").map(Number)));
        }
        return map;
    });
}
// Ottenere le informazioni di un evento dal database (utilizzato in getEventsInfoById, UNUSED)
function getEvent(db, event_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield executeQuery(db, `
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
        WHERE e.id = ? 
        GROUP BY e.id`, [event_id]);
        const row = result[0];
        return new models_js_1.Event(row.id, row.name, row.genres ? row.genres.split(",") : [], row.instruments ? row.instruments.split(",") : [], row.artists ? row.artists.split(",") : [], row.location, row.date, row.description);
    });
}
// Ottenere le informazioni di più eventi da un array di id
// UNUSED e INCORRECT
function getEventsInfoById(db, eventsMap) {
    return __awaiter(this, void 0, void 0, function* () {
        const events = [];
        for (const i of eventsMap) {
            events.push(yield getEvent(db, i.event_id));
        }
        return events;
    });
}
// Ottenere gli id degli eventi dal database (utilizzato in cb)
function getEventsId(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, 'SELECT id FROM event');
        return results.map(row => row.id);
    });
}
// Ottenere gli id degli eventi seguiti da un utente (utilizzato in cb)
function getEventsIdByUserId(db, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, 'SELECT event_id FROM user_event WHERE user_id = ?', [user_id]);
        return results.map(row => row.event_id);
    });
}
// Ottenere gli id degli eventi più popolari, in base al numero di utenti che li seguono (utilizzato in cb)
function getPopularEventsId(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, `SELECT event_id FROM user_event GROUP BY event_id ORDER BY COUNT(user_id) DESC`);
        return results.map(row => row.event_id);
    });
}
// Ottenere i nomi di tutti i generi musicali (utilizzato in cb)
function getAllGenresName(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, 'SELECT name FROM genre');
        return results.map(row => row.name);
    });
}
// Ottenere i nomi di tutti gli strumenti (utilizzato in cb)
function getAllInstrumentsName(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, 'SELECT name FROM instrument');
        return results.map(row => row.name);
    });
}
// Ottenere gli id di tutti gli artisti (utilizzato in cb)
function getAllArtistsId(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, 'SELECT id FROM artist');
        return results.map(row => row.id);
    });
}
// Ottenere i generi preferiti di un utente (utilizzato in cb)
function getGenresNameByUserId(db, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, 'SELECT genre FROM user_genre WHERE user_id = ?', [user_id]);
        return results.map(row => row.genre);
    });
}
// Ottenere gli strumenti suonati da un utente (utilizzato in cb)
function getInstrumentsNameByUserId(db, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield executeQuery(db, 'SELECT instrument FROM user_instrument WHERE user_id = ?', [user_id]);
        return result.map(row => row.instrument);
    });
}
// Ottenere gli artisti seguiti da un utente (utilizzato in cb)
function getArtistsIdByUserId(db, user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield executeQuery(db, 'SELECT artist_id FROM user_artist WHERE user_id = ?', [user_id]);
        return result.map(row => row.artist_id);
    });
}
// Ottenere i generi di un evento (utilizzato in cb)
function getGenresNameByEventId(db, event_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, 'SELECT genre FROM event_genre WHERE event_id = ?', [event_id]);
        return results.map(row => row.genre);
    });
}
// Ottenere gli strumenti di un evento (utilizzato in cb)
function getInstrumentsNameByEventId(db, event_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, 'SELECT instrument FROM event_instrument WHERE event_id = ?', [event_id]);
        return results.map(row => row.instrument);
    });
}
// Ottenere gli artisti di un evento (utilizzato in cb)
function getArtistsIdByEventId(db, event_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield executeQuery(db, 'SELECT artist_id FROM event_artist WHERE event_id = ?', [event_id]);
        return results.map(row => row.artist_id);
    });
}
// Controllare se il database è già popolato, ovvero se contiene almeno un utente
function isDatabasePopulated(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield executeQuery(db, 'SELECT COUNT(*) as count FROM user');
        return result[0].count > 0;
    });
}
// Popolare il database con i dati iniziali
function populateIfEmpty(db) {
    return __awaiter(this, void 0, void 0, function* () {
        // Controllo se il database è già popolato
        if (!(yield isDatabasePopulated(db))) {
            // Se non è popolato, lo popolo con i dati iniziali
            yield executeQuery(db, `BEGIN TRANSACTION`); // Inizio la transazione
            console.log("Database vuoto, popolamento in corso...");
            try {
                // Inserimento degli user da ./data/user.json
                const dataUsers = loadDataFromFile('./data/user.json');
                for (const user of dataUsers) {
                    yield insertUser(db, user.id, user.name, user.surname, user.age, user.position);
                }
                // Inserimento degli eventi da ./data/event.json
                const dataEvents = loadDataFromFile('./data/event.json');
                for (const event of dataEvents) {
                    yield insertEvent(db, event.id, event.name, event.location, event.date, event.description);
                }
                //Inserimento dei generi da ./data/genre.json
                const dataGenres = loadDataFromFile('./data/genre.json');
                for (const genre of dataGenres) {
                    yield insertGenre(db, genre.name);
                }
                //Inserimento dei strumenti da ./data/instrument.json
                const dataInstruments = loadDataFromFile('./data/instrument.json');
                for (const instrument of dataInstruments) {
                    yield insertInstrument(db, instrument.name);
                }
                //Inserimento degli artisti da ./data/artist.json
                const dataArtists = loadDataFromFile('./data/artist.json');
                for (const artist of dataArtists) {
                    yield insertArtist(db, artist.id, artist.name);
                }
                // Inserimento delle relazioni tra utenti ed eventi da ./data/user_event.json
                const dataUserEvent = loadDataFromFile('./data/user_event.json');
                for (const relation of dataUserEvent) {
                    yield insertUserEvent(db, relation.user_id, relation.event_id);
                }
                // Inserimento delle relazioni tra utenti e generi da ./data/user_genre.json
                const dataUserGenre = loadDataFromFile('./data/user_genre.json');
                for (const relation of dataUserGenre) {
                    yield insertUserGenre(db, relation.user_id, relation.genre);
                }
                // Inserimento delle relazioni tra utenti e strumenti da ./data/user_instrument.json
                const dataUserInstrument = loadDataFromFile('./data/user_instrument.json');
                for (const relation of dataUserInstrument) {
                    yield insertUserInstrument(db, relation.user_id, relation.instrument);
                }
                // Inserimento delle relazioni tra utenti e artisti da ./data/user_artist.json
                const dataUserArtist = loadDataFromFile('./data/user_artist.json');
                for (const relation of dataUserArtist) {
                    yield insertUserArtist(db, relation.user_id, relation.artist_id);
                }
                //Inserimento delle relazioni tra eventi e generi da ./data/event_genre.json
                const dataEventGenre = loadDataFromFile('./data/event_genre.json');
                for (const relation of dataEventGenre) {
                    yield insertEventGenre(db, relation.event_id, relation.genre);
                }
                //Inserimento delle relazioni tra eventi e strumenti da ./data/event_genre.json
                const dataEventInstrument = loadDataFromFile('./data/event_instrument.json');
                for (const relation of dataEventInstrument) {
                    yield insertEventInstrument(db, relation.event_id, relation.instrument);
                }
                //Inserimento delle relazioni tra eventi e artisti da ./data/event_artist.json
                const dataEventArtist = loadDataFromFile('./data/event_artist.json');
                for (const relation of dataEventArtist) {
                    yield insertEventArtist(db, relation.event_id, relation.artist_id);
                }
                yield executeQuery(db, `COMMIT`);
                console.log("Database popolato con successo");
            }
            catch (err) {
                yield executeQuery(db, `ROLLBACK`);
                console.error("Errore in populateIfEmpty: " + err.message);
            }
        }
    });
}
exports.default = { openDatabase, closeDatabase, createTable, getAllUsersEvents, getEventsId, getEventsIdByUserId, getPopularEventsId,
    getAllGenresName, getAllInstrumentsName, getAllArtistsId, getGenresNameByUserId, getInstrumentsNameByUserId,
    getArtistsIdByUserId, getGenresNameByEventId, getInstrumentsNameByEventId, getArtistsIdByEventId, populateIfEmpty };
