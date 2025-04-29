"use strict";
/*  Logica per aggiungere un nuovo utente al database
    Le informazioni dell'utente vengono lette da un file JSON e inserite nel database SQLite.
    L'utente non può essere già presente nel database siccome l'id viene generato automaticamente in base all'ultimo id presente.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const readline = __importStar(require("node:readline/promises"));
const node_process_1 = require("node:process");
const db_operations_1 = __importDefault(require("./db_operations"));
const models_1 = require("./models");
function numericQuestion(rl, question) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const input = yield rl.question(question); // Chiedere all'utente di inserire un numero
            const data = parseInt(input); // Convertire la risposta in un numero
            if (!isNaN(data)) { // Se non è un numero, chiedere di nuovo
                return data;
            }
            console.log("Inserire un numero valido");
        }
    });
}
function stringQuestion(rl, question) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const input = yield rl.question(question); // Chiedere all'utente di inserire una stringa
            if (input.length > 0) { // Se non è una stringa, chiedere di nuovo
                return input;
            }
            console.log("Inserire una stringa valida");
        }
    });
}
function listStringQuestion(rl, question) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const input = yield rl.question(question); // Chiedere all'utente di inserire una lista di stringhe
            const data = input.split(',').map(s => s.trim()); // Convertire la risposta in un array di stringhe
            if (data.length > 0) { // Se non è una lista, chiedere di nuovo
                return data;
            }
            console.log("Inserire una lista valida");
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const rl = readline.createInterface({ input: node_process_1.stdin, output: node_process_1.stdout }); // Creare un'interfaccia di lettura per l'input dell'utente
        console.log("------ Inserimento nuovo utente ------\n"); // Messaggio di benvenuto
        const userData = new models_1.User(0, "", "", 0, "", [], "", []); // Creare un oggetto vuoto per i dati dell'utente
        try {
            userData.name = yield stringQuestion(rl, "Nome: "); // Chiedere all'utente di inserire il nome
            userData.surname = yield stringQuestion(rl, "Cognome: "); // Chiedere all'utente di inserire il cognome
            userData.age = yield numericQuestion(rl, "Età: "); // Chiedere all'utente di inserire l'età
            userData.city = yield stringQuestion(rl, "Città: "); // Chiedere all'utente di inserire la città
            userData.genres = yield listStringQuestion(rl, "Generi (separati da virgola): "); // Chiedere all'utente di inserire i generi
            userData.instrument = yield stringQuestion(rl, "Strumento: "); // Chiedere all'utente di inserire lo strumento
            userData.artists = yield listStringQuestion(rl, "Artisti seguiti (separati da virgola): "); // Chiedere all'utente di inserire gli artisti seguiti
        }
        catch (_a) {
            console.error("Errore durante l'inserimento dei dati dell'utente"); // Messaggio di errore
            rl.close();
            return;
        }
        finally {
            rl.close();
        }
        // Inserimento nel db
        let db = null;
        try {
            db = yield db_operations_1.default.openDatabase();
            yield db_operations_1.default.createTable(db);
            yield db_operations_1.default.populateIfEmpty(db);
            const id = (yield db_operations_1.default.getLastId(db, "user")) + 1;
            userData.id = id; // Assegnare l'ID all'utente
            console.log(`\nInserimento utente ${userData.id} nel database...`);
            yield db_operations_1.default.insertUser(db, userData.id, userData.name, userData.surname, userData.age, userData.city);
            for (const genre of userData.genres) {
                yield db_operations_1.default.insertUserGenre(db, userData.id, genre); // Inserire i generi dell'utente nel database
            }
            yield db_operations_1.default.insertUserInstrument(db, userData.id, userData.instrument); // Inserire lo strumento dell'utente nel database
            for (const artist of userData.artists) {
                const id = yield db_operations_1.default.getArtistsIdByName(db, artist); // Verificare se l'artista esiste nel database
                if (id != undefined) { // Se l'artista esiste, inserire la relazione
                    yield db_operations_1.default.insertUserArtist(db, userData.id, id); // Inserire l'artista dell'utente nel database
                }
                else {
                    console.error(`Artista ${artist} non trovato nel database`); // Messaggio di errore se l'artista non esiste
                }
            }
            const user = yield db_operations_1.default.getUserInfo(db, userData.id); // Ottenere i dati dell'utente appena inserito
            console.log("\n------ Dati inseriti con successo ------\n"); // Messaggio di successo
            user.printInfo(); // Stampa i dati dell'utente appena inserito
        }
        catch (err) {
            console.error("Errore durante l'inserimento dei dati dell'utente\n", err); // Messaggio di errore
        }
        finally {
            if (db) {
                yield db_operations_1.default.closeDatabase(db); // Chiudere il database
            }
        }
    });
}
main();
/*
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
