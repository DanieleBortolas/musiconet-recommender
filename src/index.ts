/*  Punto di ingresso dell'applicazione.
    Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
    Per compilare il file, eseguire il comando `tsc`
    Per eseguire il file, eseguire il comando `node dist/index.js`
    Oppure eseguire il file ./start.bat
*/

import {Database} from 'sqlite3'
import dbOp from './db_operations'
import hybrid from './hybrid_recommender.js'
import cb from './content_based.js'
import cf from './collaborative_filtering.js'
import {User, Event} from './models.js'

// Costanti
const N_RECOMMENDATIONS: number = 5     // Numero eventi da consigliare
const K_NEIGHBORS: number = 20          // Numero di vicini da considerare per cf e hybrid
const ALPHA: number = 0.5              // Peso di cb per il risultato finale in hybrid (il peso di cf è 1-alpha)


// Interfaccia per gli argomenti passati da riga di comando
interface Arguments{
    user_id?: number,                // ID dell'utente per cui generare le raccomandazioni
    alpha?: number,                 // Peso per il content-based filtering nell'approccio ibrido
    k?: number,                     // Numero di vicini da considerare per il collaborative filtering
    n?: number,                     // Numero di eventi da consigliare
    showDetailsUser?: boolean,     // Mostra i dettagli degli utenti raccomandati
    showDetailsEvents?: boolean,    // Mostra i dettagli degli eventi raccomandati
    test?: boolean,                 // Esegui il test
}

/**
 * @summary Analizzare gli argomenti passati da riga di comando
 * @param argv - Array di stringhe contenente gli argomenti passati da riga di comando
 * @return - Oggetto Arguments contenente gli argomenti analizzati
 */
function parseArguments(argv: string[]): Arguments{
    const args: Arguments = {}
    // Controllo se sono stati passati argomenti da riga di comando
    if(argv.length < 3){
        throw new Error(`Nessun argomento passato`)
    }

    // Controllo se sono stati passati argomenti validi
    for(let i=2; i<argv.length; i++){
        const arg: string = argv[i]
        const value: string = argv[i+1]
        switch(arg){
            case '--user':
                const user_id: number = parseInt(value)
                if(!isNaN(user_id)){
                    args.user_id = user_id
                    i++
                }else{
                    //console.log(`Valore non valido per --user: ${value}`)
                    throw new Error(`Valore non valido per --user: ${value}`)
                }
                break
            
            case '--test':
                args.test = true
                break
            
            case '--alpha':
                const alpha: number = parseFloat(value)
                if(!isNaN(alpha)){
                    args.alpha = alpha
                    i++
                }else{
                    //console.log(`Valore non valido per --alpha: ${value}`)
                    throw new Error(`Valore non valido per --alpha: ${value}`)
                }
                break
            
            case '--k':
                const k: number = parseInt(value)
                if(!isNaN(k)){
                    args.k = k
                    i++
                }else{
                    //console.log(`Valore non valido per --k: ${value}`)
                    throw new Error(`Valore non valido per --k: ${value}`)
                }
                break
            
            case '--n':
                const n: number = parseInt(value)
                if(!isNaN(n)){
                    args.n = n
                    i++
                }else{
                    throw new Error(`Valore non valido per --n: ${value}`)
                }
                break
            
            case '--detailsUser':
                args.showDetailsUser = true
                break
            
            case '--detailsEvents':
                args.showDetailsEvents = true
                break
            
            default:
                throw new Error(`Argomento non valido: ${arg}`)
        }
    }
    return args
}

/**
 * @summary Eseguire l'algoritmo di raccomandazione per un utente specifico
 * @param db - Database SQLite
 * @param user_id - ID dell'utente
 * @param nEvents - Numero di eventi da consigliare (default: N_RECOMMENDATIONS)
 * @param kNeighbor - Numero di vicini da considerare (default: K_NEIGHBORS)
 * @param alpha - Peso per il content-based filtering (default: ALPHA)
 * @param userDetails - Mostra i dettagli dell'utente (default: false)
 * @param eventsDetails - Mostra i dettagli degli eventi raccomandati (default: false)
 * @return - Void
 */
async function runTestForUser(db: Database, user_id: number, nEvents: number = N_RECOMMENDATIONS, 
                                                             kNeighbor: number = K_NEIGHBORS, 
                                                             alpha: number = ALPHA,
                                                             userDetails: boolean = false,
                                                             eventsDetails: boolean = false): Promise<void>{
    console.log(`Raccomandazioni per l'utente ${user_id}`)
    
    // Stampare i dettagli dell'utente
    if(userDetails){
        const user: User | undefined = await dbOp.getUserInfo(db, user_id)
        if(user){
            user.printInfo()
        }else{
            console.log(`Utente con id ${user_id} non trovato`)
        }
    }

    // Stampare le raccomandazioni da cb
    console.log(`\nContent based: `)
    const cbResults = await cb.getContentBasedRecommendations(db, user_id, nEvents)
    console.log(cbResults)

    // Stampare le raccomandazioni da cf
    console.log(`\nCollaborative filtering: `)
    const cfResults = await cf.getCollaborativeFilteringRecommendations(db, user_id, nEvents, kNeighbor)
    console.log(cfResults)

    // Stampare le raccomandazioni di hybrid
    console.log(`\nHybrid: `)
    const hybridResults = await hybrid.getHybridRecommendations(db, user_id, nEvents, kNeighbor, alpha)
    console.log(hybridResults)

    // Stampare i dettagli degli eventi raccomandati
    if(eventsDetails){
        for(const rec of hybridResults){
            const event: Event | undefined = await dbOp.getEventInfo(db, rec.event_id)
            if(event){
                event.printInfo()
            }else{
                console.log(`Evento con id ${rec.event_id} non trovato`)
            }
        }
    }

    console.log("\n----------------------------------------\n");
}

/**
 * @summary Funzione principale per l'esecuzione del programma
 * @param - Void
 * @return - Void
 */
async function main(){
    try{
        // Analisi degli argomenti passati da riga di comando
        const args = parseArguments(process.argv)
        
        // Inizializzazione del database
        const db = await dbOp.openDatabase()    // Apro il database
        await dbOp.createTable(db)              // Creo le tabelle se non esistono
        await dbOp.populateIfEmpty(db)          // Popolo il database se è vuoto
        
        if(args.test){
            // Vettore degli id selezionati
            const idsVector: number[] = [34, 30, 52, 4, 33, 14, 27, 18, 26]

            // Applico runTestForUser per ogni id nel vettore
            console.log("\n----------------------------------------\n");
            for(const id of idsVector){ 
                await runTestForUser(db, id, args.n, args.k, args.alpha, args.showDetailsUser, args.showDetailsEvents)
            }
        }else if(args.user_id){
            // Se l'utente è specificato, stampo le raccomandazioni per quell'utente
            await runTestForUser(db, args.user_id, args.n, args.k, args.alpha, args.showDetailsUser, args.showDetailsEvents)
        }
        
        await dbOp.closeDatabase(db) // Chiudo il database

    }catch(err){
        // Gestione degli errori
        console.error("\n --- Errore durante l'esecuzione --- \n", err)
        return
    }
}



main()