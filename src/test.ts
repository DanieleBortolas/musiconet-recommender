/*  File di test 
    Sono stati selezionati degli utenti specifici:
    - id: 34 (standard)
    - id: 30 (standard)
    - id: 52 (cold start)
    - id: 4 (sparso)
    - id: 33 (sparso)
    - id: 14 (nicchia)
    - id: 27 (nicchia)
    - id: 18 (eclettico)
    - id: 26 (eclettico)
    
    File ritorna i primi 5 eventi suggeriti da cf, cb e hybrid
*/

import cb from './content_based'
import cf from './collaborative_filtering'
import hybrid from './hybrid_recommender'
import {Database} from 'sqlite3'
import dbOp from './db_operations'

// Costanti
const N_RECOMMENDATIONS: number = 5     // Numero eventi da consigliare
const K_NEIGHBORS: number = 20          // Numero di vicini da considerare per cf e hybrid
const ALPHA: number = 0.05              // Peso di cb per il risultato finale in hybrid (il peso di cf è 1-alpha)

/**
 * @summary Eseguire l'algoritmo di raccomandazione per un utente specifico
 * @param db - Database SQLite
 * @param user_id - ID dell'utente
 * @return - Void
 */
async function runTestForUser(db: Database, user_id: number): Promise<void>{
    console.log(`Raccomandazioni per l'utente ${user_id}`)
        
    // Stampa delle raccomandazioni da cb
    console.log(`Content based: `)
    const cbResults = await cb.getContentBasedRecommendations(db, user_id, N_RECOMMENDATIONS)
    console.log(cbResults)

    // Stampa delle raccomandazioni da cf
    console.log(`Collaborative filtering: `)
    const cfResults = await cf.getCollaborativeFilteringRecommendations(db, user_id, N_RECOMMENDATIONS, K_NEIGHBORS)
    console.log(cfResults)

    // Stampa delle raccomandazioni di hybrid
    console.log(`Hybrid: `)
    const hybridResults = await hybrid.getHybridRecommendations(db, user_id, N_RECOMMENDATIONS, K_NEIGHBORS, ALPHA)
    console.log(hybridResults)

    console.log("\n----------------------------------------\n");
}

/**
 * @summary Funzione principale per testare gli algoritmi di raccomandazione
 * @param - Void
 * @return - Void
 */
async function test(): Promise<void> {
    const db = await dbOp.openDatabase()
    await dbOp.createTable(db)
        
    //Popolo il database se è vuoto
    await dbOp.populateIfEmpty(db)

    // Vettore degli id selezionati
    const idsVector: number[] = [34, 30, 52, 4, 33, 14, 27, 18, 26]

    // Applico runTestForUser per ogni id nel vettore
    console.log("\n----------------------------------------\n");
    for(const id of idsVector){
        await runTestForUser(db, id)
    }
    
    // Chiudo il database
    await dbOp.closeDatabase(db)
}

// Eseguire il test
test()