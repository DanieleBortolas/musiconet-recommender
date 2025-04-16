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
const nEvents: number = 5       // Numero eventi da consigliare
const kNeighbors: number = 20   // Numero di vicini da considerare per cf e hybrid
const alpha: number = 0.5       // Peso per il risultato finale in hybrid


async function runTestForUser(db: Database, user_id: number): Promise<void>{
    console.log(`Raccomandazioni per l'utente ${user_id}`)
        
    // Stampa delle raccomandazioni da cb
    console.log(`Content based: `)
    const cbResults = await cb.getContentBasedRecommendations(db, user_id, nEvents)
    console.log(cbResults)

    // Stampa delle raccomandazioni da cf
    console.log(`Collaborative filtering: `)
    const cfResults = await cf.getCollaborativeFilteringRecommendations(db, user_id, nEvents, kNeighbors)
    console.log(cfResults)

    // Stampa delle raccomandazioni di hybrid
    console.log(`Hybrid: `)
    const hybridResults = await hybrid.getHybridRecommendations(db, user_id, nEvents, kNeighbors, alpha)
    console.log(hybridResults)

    console.log("\n----------------------------------------\n");
}



async function test(): Promise<void> {
    const db = await dbOp.openDatabase()
    await dbOp.createTable(db)
        
    //Conto il numero di utenti nel database
    if(!(await dbOp.isDatabasePopulated(db))){
        //Popolo il database se è vuoto
        await dbOp.populate(db)
        console.log('Database popolato con successo')
    }

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

test()