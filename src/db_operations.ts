import {Database} from 'sqlite3'
import fs from 'fs'
import {User, Event} from './models.js'

//Funzione di errore per inserimento: stampa l'errore oppure un messaggio di controllo 
function handleError(err: Error | null, control_message: string){
    if(err){
        console.log(err.message)
    }else{
        //console.log(control_message)
    }
}
//Funzione di errore per query: stampa l'errore oppure un messaggio di controllo
function handleQuery<T>(err: Error | null, rows: T| PromiseLike<any[]>, resolve: (value: T | PromiseLike<any[]>) => void, reject: (error: Error) => void){
    if(err){
        console.log(err.message)
        reject(err)
    }else{
        resolve(rows)
    }
}

// Caricare i dati da un file JSON
function loadDataFromFile(path: string): Promise<any[]>{
    const data = fs.readFileSync(path, 'utf-8')
    return JSON.parse(data)
}

// Aprire il database
function openDatabase(): Database{
    const db = new Database('musiconet.db', (err) => handleError(err, 'Database aperto correttamente'))
    return db
}

// Chiudere il database
function closedDatabase(db: Database): Promise<boolean>{
    return new Promise((resolve, reject) => {
        db.close((err) => handleError(err, 'Database chiuso correttamente'))
    })
}

// Creare le tabelle nel database
async function createTable(db: Database): Promise<void>{
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
        `)
        db.run(`
            CREATE TABLE IF NOT EXISTS user_instrument (
                user_id INTEGER,
                instrument TEXT,
                PRIMARY KEY(user_id, instrument),
                FOREIGN KEY(user_id) REFERENCES user(id),
                FOREIGN KEY(instrument) REFERENCES instrument(name)
            )
        `)
        db.run(`
            CREATE TABLE IF NOT EXISTS user_artist (
                user_id INTEGER,
                artist_id TEXT,
                PRIMARY KEY(user_id, artist_id),
                FOREIGN KEY(user_id) REFERENCES user(id),
                FOREIGN KEY(artist_id) REFERENCES artist(id)
            )
        `)
        db.run(`
            CREATE TABLE IF NOT EXISTS event_genre (
                event_id INTEGER,
                genre TEXT,
                PRIMARY KEY(event_id, genre),
                FOREIGN KEY(event_id) REFERENCES event(id),
                FOREIGN KEY(genre) REFERENCES genre(name)
            )
        `)
        db.run(`
            CREATE TABLE IF NOT EXISTS event_instrument (
                event_id INTEGER,
                instrument TEXT,
                PRIMARY KEY(event_id, instrument),
                FOREIGN KEY(event_id) REFERENCES event(id),
                FOREIGN KEY(instrument) REFERENCES instrument(name)
            )
        `)
        db.run(`
            CREATE TABLE IF NOT EXISTS event_artist (
                event_id INTEGER,
                artist_id TEXT,
                PRIMARY KEY(event_id, artist_id),
                FOREIGN KEY(event_id) REFERENCES event(id),
                FOREIGN KEY(artist_id) REFERENCES artist(id)
            )
        `)
        
    })
    console.log('Tabelle create correttamente')
}

// Inserire un utente nel database
async function insertUser(db: Database, id: number, name: string, surname: string, age: number, city: string): Promise<void>{
    db.run(`INSERT INTO user (id, name, surname, age, city) VALUES (?, ?, ?, ?, ?)`, 
        [id, name, surname, age, city], (err) => handleError(err, `User ${name} inserito correttamente`)
    )
}


// Inserire un evento nel database
async function insertEvent(db: Database, id: number, name: string, location: string, date: string, description: string): Promise<void>{
    db.run(`INSERT INTO event (id, name, location, date, description) VALUES (?, ?, ?, ?, ?)`,
        [id, name, location, date, description], (err) => handleError(err, `Evento ${name} inserito correttamente`)
    )
}

//Inserire un genere nel database
async function insertGenre(db: Database, name: string): Promise<void>{
    db.run(`INSERT INTO genre (name) VALUES (?)`, 
        [name], (err) => handleError(err, `Genere ${name} inserito correttamente`)
    )
}

//Inserire uno strumento nel database
async function insertInstrument(db: Database, name: string): Promise<void>{
    db.run(`INSERT INTO instrument (name) VALUES (?)`,
        [name], (err) => handleError(err, `Strumento ${name} inserito correttamente`)
    )
}

//Inserire un artista nel database
async function insertArtist(db: Database, id: number, name: string): Promise<void>{
    db.run(`INSERT INTO artist (id, name) VALUES (?, ?)`,
        [id, name], (err) => handleError(err, `Artista ${name} inserito correttamente`)
        )
}

// Inserire una relazione tra utente ed evento nel database
async function insertUserEvent(db: Database, user_id: number, event_id: number): Promise<void>{
    db.run(`INSERT INTO user_event (user_id, event_id) VALUES (?, ?)`,
        [user_id, event_id], (err) => handleError(err, `Relazione tra utente ${user_id} e evento ${event_id} inserita correttamente` )
    )
}

//Inserire una relazione tra utente e genere nel database
async function insertUserGenre(db: Database, user_id: number, genre: string): Promise<void>{
    db.run(`INSERT INTO user_genre (user_id, genre) VALUES (?, ?)`,
        [user_id, genre], (err) => handleError(err, `Relazione tra utente ${user_id} e genere ${genre} inserita correttamente`)
    )
}

// Inserire una relazione tra utente e strumento nel database
async function insertUserInstrument(db: Database, user_id: number, instrument: string): Promise<void>{
    db.run(`INSERT INTO user_instrument (user_id, instrument) VALUES (?, ?)`,
        [user_id, instrument], (err) => handleError(err, `Relazione tra utente ${user_id} e strumento ${instrument} inserita correttamente`)
    )
}

// Inserire una relazione tra utente e artista nel database
async function insertUserArtist(db: Database, user_id: number, artist_id: number): Promise<void>{
    db.run(`INSERT INTO user_artist (user_id, artist_id) VALUES (?, ?)`,
        [user_id, artist_id], (err) => handleError(err, `Relazione tra utente ${user_id} e artista ${artist_id} inserita correttamente`)
    )
}

//Inserire una relazione tra evento e genere nel database
async function insertEventGenre(db: Database, event_id: number, genre: string): Promise<void>{
    db.run(`INSERT INTO event_genre (event_id, genre) VALUES (?, ?)`,
        [event_id, genre], (err) => handleError(err, `Relazione tra evento ${event_id} e genere ${genre} inserita correttamente`)
    )
}

// Inserire una relazione tra evento e strumento nel database
async function insertEventInstrument(db: Database, event_id: number, instrument: string): Promise<void>{
    db.run(`INSERT INTO event_instrument (event_id, instrument) VALUES (?, ?)`,
        [event_id, instrument], (err) => handleError(err, `Relazione tra evento ${event_id} e strumento ${instrument} inserita correttamente`)
    )
}

// Inserire una relazione tra evento e artista nel database
async function insertEventArtist(db: Database, event_id: number, artist_id: number): Promise<void>{
    db.run(`INSERT INTO event_artist (event_id, artist_id) VALUES (?, ?)`,
        [event_id, artist_id], (err) => handleError(err, `Relazione tra evento ${event_id} e artista ${artist_id} inserita correttamente`)
    )
}

// Eseguire una query sul database
async function executeQuery(db: Database, query: string, params: any[] = []): Promise<any[]>{
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => handleQuery(err, rows, resolve, reject))
    })
}

// Ottenere gli utenti dal database
async function getUsers(db: Database): Promise<User[]>{
    const results = await executeQuery(db, `
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
        GROUP BY u.id`)
    return results.map(row => 
        new User(row.id, row.name, row.surname, row.age, row.city, 
                row.genres ? row.genres.split(",") : [], 
                row.instrument !== null ? row.instrument : "Nessuno", 
                row.artists ? row.artists.split(",") : []
            )
    )
}

// Ottenere gli eventi dal database
async function getEvents(db: Database): Promise<any[]>{
    const results = await executeQuery(db, `
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
        GROUP BY e.id`)
    return results.map(row => 
        new Event(row.id, row.name, 
                row.genres ? row.genres.split(",") : [], 
                row.instruments ? row.instruments.split(",") : [], 
                row.artists ? row.artists.split(",") : [],
                row.location, row.date, row.description
            )
    )
}

// Ottenere gli eventi di un utente dal database
async function getUserEvents(db: Database, user_id: number): Promise<any[]>{
    return executeQuery(db, 
        `SELECT * FROM event WHERE event_id IN (SELECT event_id FROM user_event_relation WHERE user_id = ?)`, 
        [user_id]) 
}

// Popolare il database con i dati iniziali
async function populate(db: Database): Promise<void>{
    await executeQuery(db, `BEGIN TRANSACTION`)
    try{       
        // Inserimento degli user da ./data/user.json
        const dataUsers = await loadDataFromFile('./data/user.json')
        for(const user of dataUsers){
            await insertUser(db,user.id, user.name, user.surname, user.age, user.position)
        }
        
        // Inserimento degli eventi da ./data/event.json
        const dataEvents = await loadDataFromFile('./data/event.json')
        for(const event of dataEvents){
            await insertEvent(db, event.id, event.name, event.location, event.date, event.description)
        }

        //Inserimento dei generi da ./data/genre.json
        const dataGenres = await loadDataFromFile('./data/genre.json')
        for(const genre of dataGenres){
            await insertGenre(db, genre.name)
        }
        
        //Inserimento dei strumenti da ./data/instrument.json
        const dataInstruments = await loadDataFromFile('./data/instrument.json')
        for(const instrument of dataInstruments){
            await insertInstrument(db, instrument.name)
        }
        
        //Inserimento degli artisti da ./data/artist.json
        const dataArtists = await loadDataFromFile('./data/artist.json')
        for(const artist of dataArtists){
            await insertArtist(db, artist.id, artist.name)
        }
        
        // Inserimento delle relazioni tra utenti ed eventi da ./data/user_event.json
        const dataUserEvent = await loadDataFromFile('./data/user_event.json')
        for(const relation of dataUserEvent){
            await insertUserEvent(db, relation.user_id, relation.event_id)
        }

        // Inserimento delle relazioni tra utenti e generi da ./data/user_genre.json
        const dataUserGenre = await loadDataFromFile('./data/user_genre.json')
        for(const relation of dataUserGenre){
            await insertUserGenre(db, relation.user_id, relation.genre)
        }

        // Inserimento delle relazioni tra utenti e strumenti da ./data/user_instrument.json
        const dataUserInstrument = await loadDataFromFile('./data/user_instrument.json')
        for(const relation of dataUserInstrument){
            await insertUserInstrument(db, relation.user_id, relation.instrument)
        }

        // Inserimento delle relazioni tra utenti e artisti da ./data/user_artist.json
        const dataUserArtist = await loadDataFromFile('./data/user_artist.json')
        for(const relation of dataUserArtist){
            await insertUserArtist(db, relation.user_id, relation.artist_id)
        }

        //Inserimento delle relazioni tra eventi e generi da ./data/event_genre.json
        const dataEventGenre = await loadDataFromFile('./data/event_genre.json')
        for(const relation of dataEventGenre){
            await insertEventGenre(db, relation.event_id, relation.genre)
        }

        //Inserimento delle relazioni tra eventi e strumenti da ./data/event_genre.json
        const dataEventInstrument = await loadDataFromFile('./data/event_instrument.json')
        for(const relation of dataEventInstrument){
            await insertEventInstrument(db, relation.event_id, relation.instrument)
        }

        //Inserimento delle relazioni tra eventi e artisti da ./data/event_artist.json
        const dataEventArtist = await loadDataFromFile('./data/event_artist.json')
        for(const relation of dataEventArtist){
            await insertEventArtist(db, relation.event_id, relation.artist_id)
        }

        await executeQuery(db, `COMMIT`)
    }catch(err){
        await executeQuery(db, `ROLLBACK`)
        console.error("Errore in populate: " + err)
    }
}
// Test per stampare i dati
async function printData(): Promise<void>{
    const db = openDatabase();
    try{
        //await createTable(db)
        //await populate(db)
    
        const users = await getUsers(db)
        console.log(users)
        const events = await getEvents(db)
        console.log(events)
        const userEvents = await getUserEvents(db, 1)
        console.log(userEvents)

    }catch(err){
        console.error("Errore in printData: " + err)
    }finally{
        await closedDatabase(db)
    }
}

//printData()

export default {openDatabase, closedDatabase, createTable, insertUser, insertEvent, insertUserEvent, executeQuery, getUsers, getEvents, getUserEvents, populate}