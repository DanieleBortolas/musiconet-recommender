/*  Logica per aggiungere un nuovo utente al database
    Le informazioni dell'utente vengono lette da un file JSON e inserite nel database SQLite.
    L'utente non può essere già presente nel database siccome l'id viene generato automaticamente in base all'ultimo id presente.
*/

import {Database} from 'sqlite3'
import * as readline from 'node:readline/promises'
import {stdin, stdout} from 'node:process'
import dbOp from './db_operations'
import {User} from './models'

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






async function numericQuestion(rl: readline.Interface, question: string): Promise<number>{
    while(true){
        const input = await rl.question(question)                  // Chiedere all'utente di inserire un numero
        const data = parseInt(input)                                   // Convertire la risposta in un numero
        if(!isNaN(data)){                                        // Se non è un numero, chiedere di nuovo
            return data
        }
        console.log("Inserire un numero valido")
    }
}

async function stringQuestion(rl: readline.Interface, question: string): Promise<string>{
    while(true){
        const input = await rl.question(question)                   // Chiedere all'utente di inserire una stringa
        if(input.length > 0){                                       // Se non è una stringa, chiedere di nuovo
            return input
        }
        console.log("Inserire una stringa valida")
    }
}

async function listStringQuestion(rl: readline.Interface, question: string): Promise<string[]>{
    while(true){
        const input = await rl.question(question)                   // Chiedere all'utente di inserire una lista di stringhe
        const data = input.split(',').map(s => s.trim())            // Convertire la risposta in un array di stringhe
        if(data.length > 0){                                        // Se non è una lista, chiedere di nuovo
            return data
        }
        console.log("Inserire una lista valida")
    }
}

async function main(){
    // 1. Creare un'interfaccia di lettura per l'input dell'utente
    const rl = readline.createInterface({input: stdin, output: stdout})         // Creare un'interfaccia di lettura per l'input dell'utente
    console.log("------ Inserimento nuovo utente ------\n") 

    const userData: User = new User(0, "", "", 0, "", [], "", [])               // Creare un oggetto vuoto per i dati dell'utente

    // 2. Chiedere all'utente di inserire i dati
    try{
        userData.name = await stringQuestion(rl, "Nome: ")                                          // Chiedere all'utente di inserire il nome
        userData.surname = await stringQuestion(rl, "Cognome: ")                                    // Chiedere all'utente di inserire il cognome
        userData.age = await numericQuestion(rl, "Età: ")                                           // Chiedere all'utente di inserire l'età
        userData.city = await stringQuestion(rl, "Città: ")                                         // Chiedere all'utente di inserire la città
        userData.genres = await listStringQuestion(rl, "Generi (separati da virgola): ")            // Chiedere all'utente di inserire i generi
        userData.instrument = await stringQuestion(rl, "Strumento: ")                               // Chiedere all'utente di inserire lo strumento
        userData.artists = await listStringQuestion(rl, "Artisti seguiti (separati da virgola): ")  // Chiedere all'utente di inserire gli artisti seguiti
    }catch{
        console.error("Errore durante l'inserimento dei dati dell'utente") // Messaggio di errore
        rl.close()
        return
    }finally{
        rl.close()
    }
    
    // 3. Inserire i dati dell'utente nel database
    let db: Database | null = null

    try{
        db = await dbOp.openDatabase()                              // Aprire il database SQLite
        await dbOp.createTable(db)                                  // Creare le tabelle se non esistono già
        await dbOp.populateIfEmpty(db)                              // Popolare il database se è vuoto
        
        const id = await dbOp.getLastId(db, "user") + 1             // Ottenere l'ID dell'utente
        userData.id = id                                            // Assegnare l'ID all'utente

        console.log(`\nInserimento utente ${userData.id} nel database...`)

        // Inserire un nuovo utente
        await dbOp.insertUser(db, userData.id, userData.name, userData.surname, userData.age, userData.city)
        
        // Inserire una relazione tra l'utente ed ogni genere preferito
        for(const genre of userData.genres){
            await dbOp.insertUserGenre(db, userData.id, genre)          // Inserire i generi dell'utente nel database
        }

        // Inserire lo strumento dell'utente
        await dbOp.insertUserInstrument(db, userData.id, userData.instrument) // Inserire lo strumento dell'utente nel database
        
        // Inserire una relazione tra l'utente ed ogni artista seguito
        for(const artist of userData.artists){
            const id = await dbOp.getArtistsIdByName(db, artist)            // Verificare se l'artista esiste nel database
            if(id != undefined){                                        
                await dbOp.insertUserArtist(db, userData.id, id)            // Inserire la relazione tra l'utente e l'artista nel database
            }else{
                console.error(`Artista ${artist} non trovato nel database`) // Messaggio di errore se l'artista non esiste
            }
        }

        const user: User = await dbOp.getUserInfo(db, userData.id)          // Ottenere i dati dell'utente appena inserito
        
        console.log("\n------ Dati inseriti con successo ------\n")         // Messaggio di successo
        user.printInfo()                                                    // Stampa i dati dell'utente appena inserito

    }catch(err){
        console.error("Errore durante l'inserimento dei dati dell'utente\n", err)        
    }finally{
        if(db){
            await dbOp.closeDatabase(db)                          // Chiudere il database
        }
    }
}

main()













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