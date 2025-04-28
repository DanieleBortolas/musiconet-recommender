/*  Logica per aggiungere un nuovo utente al database
    Le informazioni dell'utente vengono lette da un file JSON e inserite nel database SQLite.
    L'utente non può essere già presente nel database siccome l'id viene generato automaticamente in base all'ultimo id presente.
*/

import fs from 'fs'
import {Database} from 'sqlite3'
import dbOp from './db_operations'
import {User} from './models'
import {NEW_USER_PATH} from './constants'

interface UserData{
    id: number
    name: string
    surname: string
    age: number
    city: string
    genres: string[]
    instrument: string
    artists: string[]
    events: number[]
}

function loadNewUserData(filePath: string): UserData{
    try{
        const data = fs.readFileSync(filePath, 'utf8')               // Leggere il file JSON
        const userData: UserData = JSON.parse(data)                            // Convertire in oggetto JSON

        if(!userData.id){
            throw new Error("ID mancante nel file JSON")                     // Controllare se l'ID è presente
        }

        return userData                                // Restituire i dati dell'utente
    }catch(err){
        console.error("Errore durante il caricamento dei dati dal file JSON\n", err)
        throw err
    }
}


/**
 * @summary Aggiungere un nuovo utente al database
 * @param userData
 * @return - Void 
 */
/*
async function addUserFromFile(userData: UserData) {
    let db: Database | null = null;
    console.log(`Tentativo di inserimento utente ID: ${userData.id} (${userData.name} ${userData.surname})...`);

    try {
        db = await dbOp.openDatabase();
        //await dbOp.executeQuery(db, 'BEGIN TRANSACTION'); // Usa executeQuery per BEGIN/COMMIT/ROLLBACK se runAsync è solo per INSERT/CREATE

        // 1. Inserisci utente principale
        await dbOp.insertUser(db, userData.id, userData.name, userData.surname, userData.age, userData.city);

        // 2. Inserisci relazioni Genere (controlla se esistono?)
        for (const genreName of userData.genres) {
            await dbOp.insertUserGenre(db, userData.id, genreName);
        }

        // 3. Inserisci relazioni Strumento
        await dbOp.insertUserInstrument(db, userData.id, userData.instrument);
        

        // 4. Inserisci relazioni Artista
        for (const artistId of userData.artists) {
            // Qui la verifica è sulle chiavi esterne, quindi fallirà se l'artista non esiste
            const id = await dbOp.getArtistsIdByName(db, artistId); // Verifica se l'artista esiste
            await dbOp.insertUserArtist(db, userData.id, id);
        }

        // 5. Inserisci relazioni Eventi di Interesse
        for (const eventId of userData.events) {
            // Fallirà se l'evento non esiste
            await dbOp.insertUserEvent(db, userData.id, eventId);
        }

        //await dbOp.executeQuery(db, 'COMMIT');
        console.log(`Utente ID ${userData.id} inserito con successo!`);

    } catch (error: any) {
        console.error(`Errore durante l'inserimento dell'utente ID ${userData.id}:`, error.message);
        if (db) {
            console.log("Esecuzione Rollback...");
            try {
                //await dbOp.executeQuery(db, 'ROLLBACK');
                console.log("Rollback completato.");
            } catch (rollbackError: any) {
                console.error("Errore durante il Rollback:", rollbackError.message);
            }
        }
        // Potresti voler rilanciare l'errore originale se necessario
        // throw error;
    } finally {
        if (db) {
            await dbOp.closeDatabase(db);
        }
    }
}

// --- Esecuzione Script ---
try {
    const newUserData = loadNewUserData(NEW_USER_PATH);
    addUserFromFile(newUserData); // Avvia l'inserimento
} catch {
    // L'errore è già stato loggato da loadNewUserData
    console.log("Inserimento annullato a causa di errore nel file di input.");
}
*/



/**	
 * @summary Aggiungere un nuovo utente al database da un file JSON
 * @param - Void
 * @return - Void
*/
/*async function addNewUser(): Promise<void>{
    try{
        const db: Database = await dbOp.openDatabase()                  // Aprire il database SQLite
        await dbOp.createTable(db)                                      // Creare le tabelle se non esistono già
        await dbOp.populateIfEmpty(db)                                  // Popolare il database se è vuoto
        
        //const data = (dbOp.loadDataFromFile(NEW_USER_PATH))[0]               // Caricare i dati dal file JSON

        await dbOp.insertUserFromObjUser(db, data)                            // Inserire l'utente nel database
        for(const e of data.events){
            await dbOp.insertUserEvent(db, data.id, e)                        // Inserisce l'utente e gli eventi seguiti nel database
        }

        const userData = await dbOp.getUserInfo(db, data.id)            // Ottenere i dati dell'utente appena inserito
        console.log(`\n------ Nuovo utente inserito con successo -----\n`) // Stampa i dati dell'utente appena inserito
        userData.printInfo()                                            // Stampa i dati dell'utente appena inserito

        await dbOp.closeDatabase(db)                              // Chiudere il database

    }catch(err){
        console.error("\n------ Errore durante l'inserimento -----\n", err)
    }
}

addNewUser()*/