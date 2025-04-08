// Punto di ingresso dell'applicazione.
// Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
// Per compilare il file, eseguire il comando `tsc`
// Per eseguire il file, eseguire il comando `node dist/index.js`

import dbOp from './db_operations'
import {User, Event} from './models.js'
import cb from './content_based.js'
import cf from './collaborative_filtering.js'
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

    //const cbResults = await cb.getContentBasedRecommendations(db, 52)
    //const events: Event[] = await dbOp.getEventsInfoById(db, cbResults)
    //events.forEach(e => e.printInfo())
    //console.log(cbResults)

    //const map = await dbOp.getAllUsersEvents(db)
    //const neighbors = await cf.findNearestNeighbors(3, map)
    //console.log(neighbors)

    const test = 1 - distance.jaccard([99, 980, 780], [101, 102, 103])
    console.log(test)

    await dbOp.closeDatabase(db)
}

main()