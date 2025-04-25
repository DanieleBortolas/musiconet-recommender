/*  Gestione del database
    Funzioni necessarie per creare, inserire dati e interrogare il database
*/

import {Database} from 'sqlite3'
import fs from 'fs'
import {User, Event} from './models.js'
import * as constants from './constants.js'

// Caricare i dati da un file JSON
function loadDataFromFile(path: string): any[]{
    const data = fs.readFileSync(path, 'utf-8')
    return JSON.parse(data)
}

// Gestire le CallBack nelle varie operazioni al Database
// Input: errore, funzione di risoluzione, funzione di rifiuto, dati di successo (opzionale), messaggio di controllo (opzionale)
function handleDBCallBack<T = void>(err: Error | null, resolve: (value?: any) => void, 
                                    reject: (reason?: any) => void, success_data?: T, control_message?: string
                                    ): void{
    if(err){
        console.error(err.message)
        reject(err)
    } else{
        control_message? console.log(control_message): null
        resolve(success_data)
    }
}

// Aprire il database
function openDatabase(): Promise<Database>{
    return new Promise((resolve, reject) =>{
        const db = new Database(constants.DB_PATH, (err) => handleDBCallBack(err, resolve, reject, db))
    })
}

// Chiudere il database
function closeDatabase(db: Database): Promise<void>{
    return new Promise((resolve, reject) => {
        db.close((err) => handleDBCallBack(err, resolve, reject))
    })
}

// Eseguire una query di tipo INSERT, CREATE 
async function runAsync(db: Database, sql: string, params: any[] = []): Promise<void>{
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => handleDBCallBack(err, resolve, reject)) 
    })
}

// Creare le tabelle nel database
async function createTable(db: Database): Promise<void>{
    const run = (sql: string) => runAsync(db, sql)      //Creazione di un alias più corto per la funzione runAsync
    
    try{
        // Creazione tabella user
        await run(`
    	    CREATE TABLE IF NOT EXISTS user (
    	        id INTEGER PRIMARY KEY,
    	        name TEXT NOT NULL,
    	        surname TEXT NOT NULL,
    	        age INTEGER,
    	        city TEXT
    	    )
    	`)
        
        // Creazione tabella event
        await run(`
    	    CREATE TABLE IF NOT EXISTS event (
    	        id INTEGER PRIMARY KEY,
    	        name TEXT NOT NULL,
    	        location TEXT,
    	        date TEXT,
    	        description TEXT
    	    )
    	`)

        // Creazione tabelle genre, instrument e artist
    	await run(`CREATE TABLE IF NOT EXISTS genre (name TEXT PRIMARY KEY)`);
    	await run(`CREATE TABLE IF NOT EXISTS instrument (name TEXT PRIMARY KEY)`);
    	await run(`
    	    CREATE TABLE IF NOT EXISTS artist (
    	        id INTEGER PRIMARY KEY,
    	        name TEXT
    	    )
    	`);

        // Creazione tabella per relazione tra utenti ed eventi
    	await run(`
            CREATE TABLE IF NOT EXISTS user_event (
                user_id INTEGER,
                event_id INTEGER,
                PRIMARY KEY(user_id, event_id),
                FOREIGN KEY(user_id) REFERENCES user(id),
                FOREIGN KEY(event_id) REFERENCES event(id)
            )
        `);

       	// Creazione tabella per relazioni tra utenti e generi
        await run(`
            CREATE TABLE IF NOT EXISTS user_genre (
                user_id INTEGER,
                genre TEXT,
                PRIMARY KEY(user_id, genre),
                FOREIGN KEY(user_id) REFERENCES user(id),
                FOREIGN KEY(genre) REFERENCES genre(name)
            )
        `)

        // Creazione tabella per relazioni tra utenti e strumenti
    	await run(`
    	    CREATE TABLE IF NOT EXISTS user_instrument (
    	        user_id INTEGER,
    	        instrument TEXT,
    	        PRIMARY KEY(user_id, instrument),
    	        FOREIGN KEY(user_id) REFERENCES user(id),
    	        FOREIGN KEY(instrument) REFERENCES instrument(name)
    	    )
    	`)

        // Creazione tabella per relazioni tra utenti e artisti
    	await run(`
    	    CREATE TABLE IF NOT EXISTS user_artist (
    	        user_id INTEGER,
    	        artist_id INTEGER,
    	        PRIMARY KEY(user_id, artist_id),
    	        FOREIGN KEY(user_id) REFERENCES user(id),
    	        FOREIGN KEY(artist_id) REFERENCES artist(id)
    	    )
    	`)

        // Creazione tabella per relazioni tra eventi e generi
    	await run(`
    	    CREATE TABLE IF NOT EXISTS event_genre (
    	        event_id INTEGER,
    	        genre TEXT,
    	        PRIMARY KEY(event_id, genre),
    	        FOREIGN KEY(event_id) REFERENCES event(id),
    	        FOREIGN KEY(genre) REFERENCES genre(name)
    	    )
    	`)

        // Creazione tabella per relazioni tra eventi e strumenti
    	await run(`
    	    CREATE TABLE IF NOT EXISTS event_instrument (
    	        event_id INTEGER,
    	        instrument TEXT,
    	        PRIMARY KEY(event_id, instrument),
    	        FOREIGN KEY(event_id) REFERENCES event(id),
    	        FOREIGN KEY(instrument) REFERENCES instrument(name)
    	    )
    	`)

        // Creazione tabella per relazioni tra eventi e artisti
    	await run(`
    	    CREATE TABLE IF NOT EXISTS event_artist (
    	        event_id INTEGER,
    	        artist_id INTEGER,
    	        PRIMARY KEY(event_id, artist_id),
    	        FOREIGN KEY(event_id) REFERENCES event(id),
    	        FOREIGN KEY(artist_id) REFERENCES artist(id)
    	    )
    	`)
    }catch (err: any){
        console.error("Errore in createTable: ", err.message)
        throw err;
    }
}

// Inserire un utente nel database
async function insertUser(db: Database, id: number, name: string, surname: string, age: number, city: string): Promise<void>{
    const sql = `INSERT INTO user (id, name, surname, age, city) VALUES (?, ?, ?, ?, ?)`
    const params = [id, name, surname, age, city]
    return runAsync(db, sql, params)
}

// Inserire un evento nel database
async function insertEvent(db: Database, id: number, name: string, location: string, date: string, description: string): Promise<void>{
    const sql = `INSERT INTO event (id, name, location, date, description) VALUES (?, ?, ?, ?, ?)`
    const params = [id, name, location, date, description]
    return runAsync(db, sql, params)
}

//Inserire un genere nel database
async function insertGenre(db: Database, name: string): Promise<void>{
    const sql = `INSERT INTO genre (name) VALUES (?)`
    const params = [name]
    return runAsync(db, sql, params)
}

//Inserire uno strumento nel database
async function insertInstrument(db: Database, name: string): Promise<void>{
    const sql = `INSERT INTO instrument (name) VALUES (?)`
    const params = [name]
    return runAsync(db, sql, params)
}

//Inserire un artista nel database
async function insertArtist(db: Database, id: number, name: string): Promise<void>{
    const sql = `INSERT INTO artist (id, name) VALUES (?, ?)`
    const params = [id, name]
    return runAsync(db, sql, params)
}

// Inserire una relazione tra utente ed evento nel database
async function insertUserEvent(db: Database, user_id: number, event_id: number): Promise<void>{
    const sql = `INSERT INTO user_event (user_id, event_id) VALUES (?, ?)`
    const params = [user_id, event_id]
    return runAsync(db, sql, params)
}

//Inserire una relazione tra utente e genere nel database
async function insertUserGenre(db: Database, user_id: number, genre: string): Promise<void>{
    const sql = `INSERT INTO user_genre (user_id, genre) VALUES (?, ?)`
    const params = [user_id, genre]
    return runAsync(db, sql, params)
}

// Inserire una relazione tra utente e strumento nel database
async function insertUserInstrument(db: Database, user_id: number, instrument: string): Promise<void>{
    const sql = `INSERT INTO user_instrument (user_id, instrument) VALUES (?, ?)`
    const params = [user_id, instrument]
    return runAsync(db, sql, params)
}

// Inserire una relazione tra utente e artista nel database
async function insertUserArtist(db: Database, user_id: number, artist_id: number): Promise<void>{
    const sql = `INSERT INTO user_artist (user_id, artist_id) VALUES (?, ?)`
    const params = [user_id, artist_id]
    return runAsync(db, sql, params)
}

//Inserire una relazione tra evento e genere nel database
async function insertEventGenre(db: Database, event_id: number, genre: string): Promise<void>{
    const sql = `INSERT INTO event_genre (event_id, genre) VALUES (?, ?)`
    const params = [event_id, genre]
    return runAsync(db, sql, params)
}

// Inserire una relazione tra evento e strumento nel database
async function insertEventInstrument(db: Database, event_id: number, instrument: string): Promise<void>{
    const sql = `INSERT INTO event_instrument (event_id, instrument) VALUES (?, ?)`
    const params = [event_id, instrument]
    return runAsync(db, sql, params)
}

// Inserire una relazione tra evento e artista nel database
async function insertEventArtist(db: Database, event_id: number, artist_id: number): Promise<void>{
    const sql = `INSERT INTO event_artist (event_id, artist_id) VALUES (?, ?)`
    const params = [event_id, artist_id]
    return runAsync(db, sql, params)
}

// Eseguire una query di tipo SELECT
async function executeQuery(db: Database, query: string, params: any[] = []): Promise<any[]>{
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => handleDBCallBack(err, resolve, reject, rows))
    })
}

// Ottenere tutti gli id utenti e gli id eventi seguiti da ciascuno (utilizzato in cf)
async function getAllUsersEvents(db: Database): Promise<Map<number, Set<number>>>{
    const results = await executeQuery(db, `SELECT user_id, GROUP_CONCAT(event_id) AS events FROM user_event GROUP BY user_id`)
    const map: Map<number, Set<number>> = new Map<number, Set<number>>()
    
    for(const row of results){
        // Creare una mappa per ogni utente con gli eventi seguiti
        map.set(row.user_id, new Set<number>(row.events.split(",").map(Number)))    
    }

    return map
}

//Ottenere le informazioni di un utente dal database
async function getUserInfo(db: Database, user_id: number): Promise<User>{
    const result = await executeQuery(db, `
        SELECT u.id, u.name, u.surname, u.age, u.city, 
               GROUP_CONCAT(DISTINCT g.name) AS genres,
               GROUP_CONCAT(DISTINCT i.name) AS instruments,
               GROUP_CONCAT(DISTINCT a.name) AS artists
        FROM user u
        LEFT JOIN user_instrument ui ON u.id = ui.user_id
        LEFT JOIN instrument i ON ui.instrument = i.name
        LEFT JOIN user_genre ug ON u.id = ug.user_id
        LEFT JOIN genre g ON ug.genre = g.name
        LEFT JOIN user_artist ua ON u.id = ua.user_id
        LEFT JOIN artist a ON ua.artist_id = a.id
        WHERE u.id = ? 
        GROUP BY u.id`, [user_id])
    
    const row = result[0]
    return new User(row.id, row.name, row.surname, row.age, row.city,
                row.genres ? row.genres.split(",") : [], 
                row.instruments ? row.instruments.split(",") : [], 
                row.artists ? row.artists.split(",") : []
            )
}

// Ottenere le informazioni di un evento dal database
async function getEventInfo(db: Database, event_id: number): Promise<Event>{
    const result = await executeQuery(db, `
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
        GROUP BY e.id`, [event_id])
    
    const row = result[0]
    return new Event(row.id, row.name, 
                row.genres ? row.genres.split(",") : [], 
                row.instruments ? row.instruments.split(",") : [], 
                row.artists ? row.artists.split(",") : [],
                row.location, row.date, row.description
            )
}

// Ottenere le informazioni di più eventi da un array di id
// UNUSED e INCORRECT
async function getEventsInfoById(db: Database, eventsMap:{event_id: number, cosSim: number}[]): Promise<Event[]>{
    const events: Event[] = []
    for (const i of eventsMap) {
        events.push(await getEventInfo(db, i.event_id))
    }
    return events
}

// Ottenere gli id degli eventi dal database (utilizzato in cb)
async function getEventsId(db: Database): Promise<number[]>{
    const results = await executeQuery(db, 'SELECT id FROM event')
    return results.map(row => row.id)
}

// Ottenere gli id degli eventi seguiti da un utente (utilizzato in cb)
async function getEventsIdByUserId(db: Database, user_id: number): Promise<number[]>{
    const results = await executeQuery(db, 'SELECT event_id FROM user_event WHERE user_id = ?', [user_id])
    return results.map(row => row.event_id)
}

// Ottenere gli id degli eventi più popolari, in base al numero di utenti che li seguono (utilizzato in cb)
async function getPopularEventsId(db: Database): Promise<number[]>{
    const results = await executeQuery(db, `SELECT event_id FROM user_event GROUP BY event_id ORDER BY COUNT(user_id) DESC`)
    return results.map(row => row.event_id)
}

// Ottenere i nomi di tutti i generi musicali (utilizzato in cb)
async function getAllGenresName(db: Database): Promise<string[]>{
    const results = await executeQuery(db, 'SELECT name FROM genre')
    return results.map(row => row.name)
}

// Ottenere i nomi di tutti gli strumenti (utilizzato in cb)
async function getAllInstrumentsName(db: Database): Promise<string[]>{
    const results = await executeQuery(db, 'SELECT name FROM instrument')
    return results.map(row => row.name)
}

// Ottenere gli id di tutti gli artisti (utilizzato in cb)
async function getAllArtistsId(db: Database): Promise<number[]>{
    const results = await executeQuery(db, 'SELECT id FROM artist')
    return results.map(row => row.id)
}

// Ottenere i generi preferiti di un utente (utilizzato in cb)
async function getGenresNameByUserId(db: Database, user_id: number): Promise<string[]>{
    const results = await executeQuery(db, 'SELECT genre FROM user_genre WHERE user_id = ?', [user_id])
    return results.map(row => row.genre)
}

// Ottenere gli strumenti suonati da un utente (utilizzato in cb)
async function getInstrumentsNameByUserId(db: Database, user_id: number): Promise<string[]>{
    const result = await executeQuery(db, 'SELECT instrument FROM user_instrument WHERE user_id = ?', [user_id])
    return result.map(row => row.instrument)
}

// Ottenere gli artisti seguiti da un utente (utilizzato in cb)
async function getArtistsIdByUserId(db: Database, user_id: number): Promise<number[]>{
    const result = await executeQuery(db, 'SELECT artist_id FROM user_artist WHERE user_id = ?', [user_id])
    return result.map(row => row.artist_id)
}

// Ottenere i generi di un evento (utilizzato in cb)
async function getGenresNameByEventId(db: Database, event_id: number): Promise<string[]>{
    const results = await executeQuery(db, 'SELECT genre FROM event_genre WHERE event_id = ?', [event_id])
    return results.map(row => row.genre)
}

// Ottenere gli strumenti di un evento (utilizzato in cb)
async function getInstrumentsNameByEventId(db: Database, event_id: number): Promise<string[]>{
    const results = await executeQuery(db, 'SELECT instrument FROM event_instrument WHERE event_id = ?', [event_id])
    return results.map(row => row.instrument)
}

// Ottenere gli artisti di un evento (utilizzato in cb)
async function getArtistsIdByEventId(db: Database, event_id: number): Promise<number[]>{
    const results = await executeQuery(db, 'SELECT artist_id FROM event_artist WHERE event_id = ?', [event_id])
    return results.map(row => row.artist_id)
}

// Controllare se il database è già popolato, ovvero se contiene almeno un utente
async function isDatabasePopulated(db: Database): Promise<boolean>{
    const result = await executeQuery(db, 'SELECT COUNT(*) as count FROM user')
    return result[0].count > 0
}

// Popolare il database con i dati iniziali
async function populateIfEmpty(db: Database): Promise<void>{
    // Controllo se il database è già popolato
    if(!await isDatabasePopulated(db)){
        
        // Se non è popolato, lo popolo con i dati iniziali
        await executeQuery(db, `BEGIN TRANSACTION`) // Inizio la transazione
        console.log("Database vuoto, popolamento in corso...")
        
        try{ 
            
            // Inserimento degli user da ./data/user.json
            const dataUsers = loadDataFromFile(constants.USER_PATH)
            for(const user of dataUsers){
                await insertUser(db,user.id, user.name, user.surname, user.age, user.position)
            }

            // Inserimento degli eventi da ./data/event.json
            const dataEvents = loadDataFromFile(constants.EVENT_PATH)
            for(const event of dataEvents){
                await insertEvent(db, event.id, event.name, event.location, event.date, event.description)
            }

            //Inserimento dei generi da ./data/genre.json
            const dataGenres = loadDataFromFile(constants.GENRE_PATH)
            for(const genre of dataGenres){
                await insertGenre(db, genre.name)
            }

            //Inserimento dei strumenti da ./data/instrument.json
            const dataInstruments = loadDataFromFile(constants.INSTRUMENT_PATH)
            for(const instrument of dataInstruments){
                await insertInstrument(db, instrument.name)
            }

            //Inserimento degli artisti da ./data/artist.json
            const dataArtists = loadDataFromFile(constants.ARTIST_PATH)
            for(const artist of dataArtists){
                await insertArtist(db, artist.id, artist.name)
            }

            // Inserimento delle relazioni tra utenti ed eventi da ./data/user_event.json
            const dataUserEvent = loadDataFromFile(constants.USER_EVENT_PATH)
            for(const relation of dataUserEvent){
                await insertUserEvent(db, relation.user_id, relation.event_id)
            }

            // Inserimento delle relazioni tra utenti e generi da ./data/user_genre.json
            const dataUserGenre = loadDataFromFile(constants.USER_GENRE_PATH)
            for(const relation of dataUserGenre){
                await insertUserGenre(db, relation.user_id, relation.genre)
            }

            // Inserimento delle relazioni tra utenti e strumenti da ./data/user_instrument.json
            const dataUserInstrument = loadDataFromFile(constants.USER_INSTRUMENT_PATH)
            for(const relation of dataUserInstrument){
                await insertUserInstrument(db, relation.user_id, relation.instrument)
            }

            // Inserimento delle relazioni tra utenti e artisti da ./data/user_artist.json
            const dataUserArtist = loadDataFromFile(constants.USER_ARTIST_PATH)
            for(const relation of dataUserArtist){
                await insertUserArtist(db, relation.user_id, relation.artist_id)
            }

            //Inserimento delle relazioni tra eventi e generi da ./data/event_genre.json
            const dataEventGenre = loadDataFromFile(constants.EVENT_GENRE_PATH)
            for(const relation of dataEventGenre){
                await insertEventGenre(db, relation.event_id, relation.genre)
            }

            //Inserimento delle relazioni tra eventi e strumenti da ./data/event_genre.json
            const dataEventInstrument = loadDataFromFile(constants.EVENT_INSTRUMENT_PATH)
            for(const relation of dataEventInstrument){
                await insertEventInstrument(db, relation.event_id, relation.instrument)
            }

            //Inserimento delle relazioni tra eventi e artisti da ./data/event_artist.json
            const dataEventArtist = loadDataFromFile(constants.EVENT_ARTIST_PATH)
            for(const relation of dataEventArtist){
                await insertEventArtist(db, relation.event_id, relation.artist_id)
            }

            await executeQuery(db, `COMMIT`)
            console.log("Database popolato con successo")

        }catch(err: any){
            await executeQuery(db, `ROLLBACK`)
            throw new Error("\n  ----- Errore in populateIfEmpty -----\n" + err.message)
        }
    }
}

export default {openDatabase, closeDatabase, createTable, getUserInfo, getEventInfo, getAllUsersEvents, getEventsId, 
                getEventsIdByUserId, getPopularEventsId, getAllGenresName, getAllInstrumentsName, getAllArtistsId, 
                getGenresNameByUserId, getInstrumentsNameByUserId, getArtistsIdByUserId, getGenresNameByEventId, 
                getInstrumentsNameByEventId, getArtistsIdByEventId, populateIfEmpty}