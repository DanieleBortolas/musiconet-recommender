/*  Punto di ingresso dell'applicazione.
    Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query 
    per ottenere le raccomandazioni per un utente specifico o per eseguire il test su un vettore di id.
    Viene anche gestita l'analisi degli argomenti passati da riga di comando.
    
    Per compilare il progetto, eseguire il comando `tsc`
    Per eseguire il file, eseguire il comando `node dist/index.js`

    Per eseguire il file con gli argomenti da riga di comando, eseguire il comando 
        `node dist/index.js --user <user_id> --alpha <alpha> --k <k> --n <n> --detailsUser --detailsEvents`
    
    Per eseguire il test, eseguire il comando 
        `node dist/index.js --test`
    oppure 
        `node dist/index.js --test --k <k> --n <n> --alpha <alpha> --detailsUser --detailsEvents`
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
const ALPHA: number = 0.5               // Peso di cb per il risultato finale in hybrid (il peso di cf è 1-alpha)


// Interfaccia per gli argomenti passati da riga di comando
interface Arguments{
    test?: boolean,                     // Esegui il test
    user_id?: number,                   // ID dell'utente per cui generare le raccomandazioni
    alpha?: number,                     // Peso per il content-based filtering nell'approccio ibrido
    k?: number,                         // Numero di vicini da considerare per il collaborative filtering
    n?: number,                         // Numero di eventi da consigliare
    showDetailsUser?: boolean,          // Mostra i dettagli degli utenti raccomandati
    showDetailsEvents?: boolean,        // Mostra i dettagli degli eventi raccomandati
}

/**
 * @summary Analizzare gli argomenti passati da riga di comando
 * @param argv - Array di stringhe contenente gli argomenti passati da riga di comando
 * @return - Oggetto Arguments contenente gli argomenti analizzati
 */
function parseArguments(argv: string[]): Arguments{
    // 1. Controllare se sono stati passati argomenti da riga di comando
    const args: Arguments = {}
    if(argv.length < 3){
        throw new Error(`Nessun argomento passato`)
    }

    // 2. Controllare se sono stati passati argomenti validi e analizzarli
    for(let i=2; i<argv.length; i++){
        const arg: string = argv[i]
        const value: string = argv[i+1]
        switch(arg){
            
            // Argomento per eseguire il test
            case '--test':
                args.test = true
                break
            
            // Argomento per specificare l'ID dell'utente
            case '--user':
                const user_id: number = parseInt(value)
                if(!isNaN(user_id)){
                    args.user_id = user_id
                    i++
                }else{
                    throw new Error(`Valore non valido per --user: ${value}`)
                }
                break
            
            // Argomento per specificare il peso di cb nell'approccio ibrido
            case '--alpha':
                const alpha: number = parseFloat(value)
                if(!isNaN(alpha)){
                    args.alpha = alpha
                    i++
                }else{
                    throw new Error(`Valore non valido per --alpha: ${value}`)
                }
                break
            
            // Argomento per specificare il numero di vicini da considerare per cf e hybrid
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
            
            // Argomento per specificare il numero di eventi da consigliare
            case '--n':
                const n: number = parseInt(value)
                if(!isNaN(n)){
                    args.n = n
                    i++
                }else{
                    throw new Error(`Valore non valido per --n: ${value}`)
                }
                break
            
            // Argomento per mostrare i dettagli dell'utente
            case '--detailsUser':
                args.showDetailsUser = true
                break
            
            // Argomento per mostrare i dettagli degli eventi raccomandati
            case '--detailsEvents':
                args.showDetailsEvents = true
                break
            
            // Argomento per mostrare l'aiuto
            case '--help':
                console.log(`\n----------------- Aiuto -----------------`)
                console.log(`--test: Esegui il test su un vettore di id predefiniti`)
                console.log(`--user <user_id>: ID dell'utente per cui generare le raccomandazioni`)
                console.log(`--alpha <alpha>: Peso per il content-based filtering nell'approccio ibrido (default: ${ALPHA})`)
                console.log(`--k <k>: Numero di vicini da considerare per il collaborative filtering (default: ${K_NEIGHBORS})`)
                console.log(`--n <n>: Numero di eventi da consigliare (default: ${N_RECOMMENDATIONS})`)
                console.log(`--detailsUser: Mostra i dettagli dell'utente`)
                console.log(`--detailsEvents: Mostra i dettagli degli eventi raccomandati`)
                console.log(`--help: Mostra questo messaggio di aiuto`)
                console.log(`-------------------------------------------\n`)
                process.exit(0) // Esci dopo aver stampato l'aiuto
                break

            // Argomento non valido
            default:
                throw new Error(`Argomento non valido: ${arg}`)
        }
    }

    // 3. Ritornare gli argomenti analizzati
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
    
    // 1. Controllare l'esistenza dell'utente e stamparne i dettagli se richiesto
    const user: User | undefined = await dbOp.getUserInfo(db, user_id)
    if(user && userDetails)
        user.printInfo()
    
    // 2. Stampare le raccomandazioni da cb
    console.log(`\nContent based: `)
    const cbResults = await cb.getContentBasedRecommendations(db, user_id, nEvents)
    console.log(cbResults)

    // 3. Stampare le raccomandazioni da cf
    console.log(`\nCollaborative filtering: `)
    const cfResults = await cf.getCollaborativeFilteringRecommendations(db, user_id, nEvents, kNeighbor)
    console.log(cfResults)

    // 4. Stampare le raccomandazioni di hybrid
    console.log(`\nHybrid: `)
    const hybridResults = await hybrid.getHybridRecommendations(db, user_id, nEvents, kNeighbor, alpha)
    console.log(hybridResults)

    // 5. Stampare i dettagli degli eventi raccomandati se richiesto
    if(eventsDetails){
        for(const rec of hybridResults){
            const event: Event | undefined = await dbOp.getEventInfo(db, rec.event_id)
            if(event)
                event.printInfo()
        }
    }

    console.log("\n-------------------------------------------\n");
}

/**
 * @summary Funzione principale per l'esecuzione del programma
 * @param - Void
 * @return - Void
 */
async function main(){
    try{
        // 1. Analizzare gli argomenti passati da riga di comando
        const args = parseArguments(process.argv)
        
        // 2. Inizializzare il database
        const db = await dbOp.openDatabase()    // Apro il database
        await dbOp.createTable(db)              // Creo le tabelle se non esistono
        await dbOp.populateIfEmpty(db)          // Popolo il database se è vuoto
        
        // 3. Eseguire il test o le raccomandazioni per un utente specifico
        if(args.test){
            // Vettore degli id selezionati
            const idsVector: number[] = [34, 30, 52, 4, 33, 14, 27, 18, 26]

            // Applico runTestForUser per ogni id nel vettore
            console.log("\n------------- Esecuzione test -------------\n");
            for(const id of idsVector){ 
                console.log(`Raccomandazioni per l'utente ${id}`)
                await runTestForUser(db, id, args.n, args.k, args.alpha, args.showDetailsUser, args.showDetailsEvents)
            }

        }else if(args.user_id){
            // Se l'utente è specificato, stampo le raccomandazioni per quell'utente
            console.log(`\n------ Esecuzione alg. per utente ${args.user_id} ------\n`);
            await runTestForUser(db, args.user_id, args.n, args.k, args.alpha, args.showDetailsUser, args.showDetailsEvents)
        }
        
        // 4. Chiudere il database
        await dbOp.closeDatabase(db) // Chiudo il database

    }catch(err){
        // 5. Gestire gli errori
        console.error("\n------ Errore durante l'esecuzione ------\n", err)
        return
    }
}

main()