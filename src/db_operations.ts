import {Database} from 'sqlite3'
import fs from 'fs'

// Caricare i dati da un file JSON
function loadDataFromFile(path: string): Promise<any[]>{
    const data = fs.readFileSync(path, 'utf-8')
    return JSON.parse(data)
}

// Aprire il database
function openDatabase(): Database{
    const db = new Database('musiconet.db', (err) =>{
        if(err){
            console.log('Errore nell\'apertura del database: ' + err.message)
        }else{
            console.log('Database aperto correttamente')
        }
    })
    return db
}

// Chiudere il database
function closedDatabase(db: Database): Promise<boolean>{
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if(err){
                console.log('Errore nella chiusura del database: ' + err.message)
                reject(err)
            }else{
                console.log('Database chiuso correttamente')
                resolve(true)
            }
        })
    })
}

// Creare le tabelle nel database
async function createTable(db: Database): Promise<void>{
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
    })
    console.log('Tabelle create correttamente')
}

// Inserire un utente nel database
async function insertUser(db: Database, name: string, surname: string, age: number, genres: string[], instrument: string, artists: string[], position: string): Promise<void>{
    db.run(`INSERT INTO users (name, surname, age, genres, instrument, artists, position) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [name, surname, age, JSON.stringify(genres), instrument, JSON.stringify(artists), position], (err) => {
            if (err){
                console.log(err.message)
                console.log(`Errore nell'inserimento`)
            }else{
                console.log(`User ${name} inserito correttamente`)
            }
        })
}

// Inserire un evento nel database
async function insertEvent(db: Database, name: string, date: string, genres: string[], artists: string[], location: string): Promise<void>{
    db.run(`INSERT INTO events (name, date, genres, artists, location) VALUES (?, ?, ?, ?, ?)`,
        [name, date, JSON.stringify(genres), JSON.stringify(artists), location], (err) => {
            if(err){
                console.log(err.message)
            }else{
                console.log(`Evento ${name} inserito correttamente`)
            }
        })
}

// Inserire una relazione tra utente ed evento nel database
async function insertUserEventRelation(db: Database, user_id: number, event_id: number): Promise<void>{
    db.run(`INSERT INTO user_event_relation (user_id, event_id) VALUES (?, ?)`,
        [user_id, event_id], (err) => {
            if(err){
                console.log(err.message)
            }else{
                console.log(`Relazione tra utente ${user_id} e evento ${event_id} inserita correttamente`)
            }
        })
}

// Eseguire una query sul database
async function executeQuery(db: Database, query: string, params: any[] = []): Promise<any[]>{
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if(err){
                reject(err)
            }else{
                resolve(rows)
            }
        })
    })
}

// Ottenere gli utenti dal database
async function getUsers(db: Database): Promise<any[]>{
    return executeQuery(db, `SELECT * FROM users`)
}

// Ottenere gli eventi dal database
async function getEvents(db: Database): Promise<any[]>{
    return executeQuery(db, `SELECT * FROM events`)
}

// Ottenere gli eventi di un utente dal database
async function getUserEvents(db: Database, user_id: number): Promise<any[]>{
    return executeQuery(db, 
        `SELECT * FROM events WHERE event_id IN (SELECT event_id FROM user_event_relation WHERE user_id = ?)`, 
        [user_id]) 
}

// Popolare il database con i dati iniziali
async function populate(db: Database): Promise<void>{
    await executeQuery(db, `BEGIN TRANSACTION`)
    try{       
        // Inserimento degli user da ./data/users.json
        const dataUsers = await loadDataFromFile('./data/users.json')
        for(const user of dataUsers){
            await insertUser(db, user.name, user.surname, user.age, user.genres, user.instrument, user.artists, user.position)
        }
        
        // Inserimento degli eventi da ./data/events.json
        const dataEvents = await loadDataFromFile('./data/events.json')
        for(const event of dataEvents){
            await insertEvent(db, event.name, event.date, event.genres, event.artists, event.location)
        }
        
        // Inserimento delle relazioni tra utenti ed eventi da ./data/user_event_relation.json
        const dataUserEvent = await loadDataFromFile('./data/user_event_relation.json')
        for(const relation of dataUserEvent){
            await insertUserEventRelation(db, relation.user_id, relation.event_id)
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

export default {openDatabase, closedDatabase, createTable, insertUser, insertEvent, insertUserEventRelation, executeQuery, getUsers, getEvents, getUserEvents, populate}