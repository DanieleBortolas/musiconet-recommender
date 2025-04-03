// Punto di ingresso dell'applicazione.
// Qui viene aperto il database, viene creata la tabella se non esiste e vengono eseguite le query.
// Per compilare il file, eseguire il comando `tsc`
// Per eseguire il file, eseguire il comando `node dist/index.js`

import db_op from './db_operations'
import {User, Event} from './models.js'

async function main(){
    const db = await db_op.openDatabase()
    await db_op.createTable(db)
    
    //Conto il numero di utenti nel database
    if(!(await db_op.isDatabasePopulated(db))){
        //Popolo il database se è vuoto
        await db_op.populate(db)
        console.log('Database popolato con successo')
    }

    await db_op.closeDatabase(db)
}

main()