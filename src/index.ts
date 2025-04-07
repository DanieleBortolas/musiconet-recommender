// Punto di ingresso dell'applicazione.
// Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
// Per compilare il file, eseguire il comando `tsc`
// Per eseguire il file, eseguire il comando `node dist/index.js`

import dbOp from './db_operations'
import {User, Event} from './models.js'
import cb from './content_based.js'

async function main(){
    const db = await dbOp.openDatabase()
    await dbOp.createTable(db)
    
    //Conto il numero di utenti nel database
    if(!(await dbOp.isDatabasePopulated(db))){
        //Popolo il database se è vuoto
        await dbOp.populate(db)
        console.log('Database popolato con successo')
    }

    const cbResults = await cb.getContentBasedRecommendations(db, 52)
    //const events: Event[] = await dbOp.getEventsInfoById(db, cbResults)
    //events.forEach(e => e.printInfo())
    console.log(cbResults)

    await dbOp.closeDatabase(db)
}

main()