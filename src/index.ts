// Punto di ingresso dell'applicazione.
// Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
// Per compilare il file, eseguire il comando `tsc`
// Per eseguire il file, eseguire il comando `node dist/index.js`

import dbOp from './db_operations'
import {User, Event} from './models.js'
import cb from './content_based.js'
import cf from './collaborative_filtering.js'
import hybrid from './hybrid_recommender.js'
import {distance} from 'ml-distance'

async function main(){
    const db = await dbOp.openDatabase()
    await dbOp.createTable(db)
    
    //Conto il numero di utenti nel database
    if(!(await dbOp.isDatabasePopulated(db))){
        //Popolo il database se è vuoto
        await dbOp.populate(db)
        console.log('Database popolato con successo')
    }

    const user_id = 9

    //const cbResults = await cb.getContentBasedRecommendations(db, user_id)
    //const events: Event[] = await dbOp.getEventsInfoById(db, cbResults)
    //events.forEach(e => e.printInfo())
    //console.log(cbResults)

    //const cfResults = await cf.getCollaborativeFilteringRecommendations(db, user_id)
    //console.log(cfResults)

    console.log("Risultati Ibridi")
    for(let id = 0; id<53; id++){
        console.log(`Utente ${id}`)
        const results = await hybrid.getHybridRecommendations(db, id)
        console.log(results)
    }

    await dbOp.closeDatabase(db)
}

main()