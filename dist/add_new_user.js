"use strict";
/*  Logica per aggiungere un nuovo utente al database
    Le informazioni dell'utente vengono lette da un file JSON e inserite nel database SQLite.
    L'utente non può essere già presente nel database siccome l'id viene generato automaticamente in base all'ultimo id presente.
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
const fs_1 = __importDefault(require("fs"));
const db_operations_1 = __importDefault(require("./db_operations"));
const constants_1 = require("./constants");
function loadNewUserData(filePath) {
    try {
        const data = fs_1.default.readFileSync(filePath, 'utf8'); // Leggere il file JSON
        const userData = JSON.parse(data); // Convertire in oggetto JSON
        if (!userData.id) {
            throw new Error("ID mancante nel file JSON"); // Controllare se l'ID è presente
        }
        return userData; // Restituire i dati dell'utente
    }
    catch (err) {
        console.error("Errore durante il caricamento dei dati dal file JSON\n", err);
        throw err;
    }
}
// --- Funzione Principale di Inserimento ---
function addUserFromFile(userData) {
    return __awaiter(this, void 0, void 0, function* () {
        let db = null;
        console.log(`Tentativo di inserimento utente ID: ${userData.id} (${userData.name} ${userData.surname})...`);
        try {
            db = yield db_operations_1.default.openDatabase();
            //await dbOp.executeQuery(db, 'BEGIN TRANSACTION'); // Usa executeQuery per BEGIN/COMMIT/ROLLBACK se runAsync è solo per INSERT/CREATE
            // 1. Inserisci utente principale
            yield db_operations_1.default.insertUser(db, userData.id, userData.name, userData.surname, userData.age, userData.city);
            // 2. Inserisci relazioni Genere (controlla se esistono?)
            for (const genreName of userData.genres) {
                // QUI: Idealmente, dovresti verificare se genreName esiste nella tabella 'genre'.
                // Se non esiste, potresti decidere di non inserire la relazione o di inserire anche il genere.
                // Per semplicità ora, assumiamo che esistano e inseriamo la relazione.
                yield db_operations_1.default.insertUserGenre(db, userData.id, genreName);
            }
            // 3. Inserisci relazioni Strumento
            yield db_operations_1.default.insertUserInstrument(db, userData.id, userData.instrument);
            // 4. Inserisci relazioni Artista
            for (const artistId of userData.artists) {
                // Qui la verifica è sulle chiavi esterne, quindi fallirà se l'artista non esiste
                const id = yield db_operations_1.default.getArtistsIdByName(db, artistId); // Verifica se l'artista esiste
                yield db_operations_1.default.insertUserArtist(db, userData.id, id);
            }
            // 5. Inserisci relazioni Eventi di Interesse
            for (const eventId of userData.events) {
                // Fallirà se l'evento non esiste
                yield db_operations_1.default.insertUserEvent(db, userData.id, eventId);
            }
            //await dbOp.executeQuery(db, 'COMMIT');
            console.log(`Utente ID ${userData.id} inserito con successo!`);
        }
        catch (error) {
            console.error(`Errore durante l'inserimento dell'utente ID ${userData.id}:`, error.message);
            if (db) {
                console.log("Esecuzione Rollback...");
                try {
                    //await dbOp.executeQuery(db, 'ROLLBACK');
                    console.log("Rollback completato.");
                }
                catch (rollbackError) {
                    console.error("Errore durante il Rollback:", rollbackError.message);
                }
            }
            // Potresti voler rilanciare l'errore originale se necessario
            // throw error;
        }
        finally {
            if (db) {
                yield db_operations_1.default.closeDatabase(db);
            }
        }
    });
}
// --- Esecuzione Script ---
try {
    const newUserData = loadNewUserData(constants_1.NEW_USER_PATH);
    addUserFromFile(newUserData); // Avvia l'inserimento
}
catch (_a) {
    // L'errore è già stato loggato da loadNewUserData
    console.log("Inserimento annullato a causa di errore nel file di input.");
}
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
