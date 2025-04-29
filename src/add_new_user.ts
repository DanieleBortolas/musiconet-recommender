/*  Logica per aggiungere un nuovo utente al database
    Le informazioni dell'utente vengono lette da un file JSON e inserite nel database SQLite.
    L'utente non può essere già presente nel database siccome l'id viene generato automaticamente in base all'ultimo id presente.
*/

import {Database} from 'sqlite3'
import * as readline from 'node:readline/promises'
import {stdin, stdout} from 'node:process'
import dbOp from './db_operations'
import {User} from './models'

/**
 * @summary Chiedere all'utente di inserire un numero
 * @param rl - Interfaccia di lettura per l'input dell'utente
 * @param question - Domanda da porre all'utente
 * @returns - Numero inserito dall'utente
 */
async function numericQuestion(rl: readline.Interface, question: string): Promise<number>{
    while(true){
        const input = await rl.question(question)                       // Chiedere all'utente di inserire un numero
        const data = parseInt(input)                                    // Convertire la risposta in un numero
        if(!isNaN(data)){                                               // Se non è un numero, chiedere di nuovo
            return data
        }
        console.log("Inserire un numero valido")
    }
}

/**
 * @summary Chiedere all'utente di inserire una stringa
 * @param rl - Interfaccia di lettura per l'input dell'utente
 * @param question - Domanda da porre all'utente
 * @returns - Stringa inserita dall'utente
 */
async function stringQuestion(rl: readline.Interface, question: string): Promise<string>{
    while(true){
        const input = await rl.question(question)                       // Chiedere all'utente di inserire una stringa
        if(input.length > 0 && isNaN(parseInt(input))){                 // Se non è una stringa, chiedere di nuovo
            return input
        }
        console.log("Inserire una stringa valida")
    }
}

/**
 * @summary Chiedere all'utente di inserire una lista di stringhe
 * @param rl - Interfaccia di lettura per l'input dell'utente
 * @param question - Domanda da porre all'utente
 * @returns - Lista di stringhe inserite dall'utente
 */
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

/**
 * @summary Aggiungere un nuovo utente al database prendendo i dati dall'input dell'utente
 * @param - Void
 * @returns - Void
 */
async function main(): Promise<void>{
    // 1. Creare un'interfaccia di lettura per l'input dell'utente
    const rl = readline.createInterface({input: stdin, output: stdout})         // Creare un'interfaccia di lettura per l'input dell'utente
    console.log("------ Inserimento nuovo utente ------\n") 

    const userData: User = new User(0, "", "", 0, "", [], "", [])               // Creare un oggetto vuoto per i dati dell'utente
    let events: string[] = []                                                    // Creare un array vuoto per gli eventi seguiti dall'utente
    // 2. Chiedere all'utente di inserire i dati
    try{
        userData.name = await stringQuestion(rl, "Nome: ")                                          // Chiedere all'utente di inserire il nome
        userData.surname = await stringQuestion(rl, "Cognome: ")                                    // Chiedere all'utente di inserire il cognome
        userData.age = await numericQuestion(rl, "Età: ")                                           // Chiedere all'utente di inserire l'età
        userData.city = await stringQuestion(rl, "Città: ")                                         // Chiedere all'utente di inserire la città
        userData.genres = await listStringQuestion(rl, "Generi (separati da virgola): ")            // Chiedere all'utente di inserire i generi
        userData.instrument = await stringQuestion(rl, "Strumento: ")                               // Chiedere all'utente di inserire lo strumento
        userData.artists = await listStringQuestion(rl, "Artisti seguiti (separati da virgola): ")  // Chiedere all'utente di inserire gli artisti seguiti
        events = await listStringQuestion(rl, "Eventi seguiti (separati da virgola): ")       // Chiedere all'utente di inserire gli eventi seguiti
    }catch{
        console.error("Errore durante l'inserimento dei dati dell'utente")
        rl.close()
        return
    }finally{
        rl.close()
    }
    
    // 3. Inserire i dati dell'utente nel database
    let db: Database | null = null

    try{
        db = await dbOp.openDatabase()                                      // Aprire il database SQLite
        await dbOp.createTable(db)                                          // Creare le tabelle se non esistono già
        await dbOp.populateIfEmpty(db)                                      // Popolare il database se è vuoto
        
        const id = await dbOp.getLastId(db, "user") + 1                     // Ottenere l'ID dell'utente
        userData.id = id                                                    // Assegnare l'ID all'utente

        console.log(`\nInserimento utente ${userData.id} nel database...`)

        await dbOp.insertNewUser(db, userData, events)                      // Inserire l'utente nel database
        
        console.log("\n------ Dati inseriti con successo ------\n")         // Messaggio di successo
    }catch(err){
        console.error("Errore durante l'inserimento dei dati dell'utente\n", err)        
    }finally{
        if(db){
            await dbOp.closeDatabase(db)                                    // Chiudere il database
        }
    }
}

main()